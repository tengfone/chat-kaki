import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type KakiKey = {
  kakiName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  public async vectorSearch(recentChatHistory: string, kakiFileName: string) {
    const pineconeClient = <PineconeClient>this.vectorDBClient;
    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX! || ""
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: kakiFileName })
      .catch((err) => {
        console.log("[PINECONE_ERROR] Failed to get vector search result", err);
      });

    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }

    return MemoryManager.instance;
  }

  private generateRedisKakiKey(kakiKey: KakiKey): string {
    return `${kakiKey.kakiName}-${kakiKey.modelName}-${kakiKey.userId}`;
  }

  public async writeToHistory(text: string, kakiKey: KakiKey) {
    if (!kakiKey || typeof kakiKey.userId == "undefined") {
      console.log("Invalid kakiKey");
      return "";
    }

    const key = this.generateRedisKakiKey(kakiKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(kakiKey: KakiKey): Promise<string> {
    if (!kakiKey || typeof kakiKey.userId == "undefined") {
      console.log("Invalid kakiKey");
      return "";
    }
    const key = this.generateRedisKakiKey(kakiKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse(); // trick to get required data from vectorDB
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    kakiKey: KakiKey
  ) {
    const key = this.generateRedisKakiKey(kakiKey);

    if (await this.history.exists(key)) {
      console.log("Key already exists [User already have chat history]");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;

    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
