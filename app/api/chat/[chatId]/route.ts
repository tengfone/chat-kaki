import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import { Replicate } from "langchain/llms/replicate";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);
    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const kaki = await prismadb.kaki.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!kaki) {
      return new NextResponse("Kaki not found", { status: 404 });
    }

    const name = kaki.id;
    const kaki_file_name = name + ".txt";
    const kakiKey = {
      kakiName: name!,
      userId: user.id,
      modelName: "llama2-13b",
    };
    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readLatestHistory(kakiKey);

    // If no records, seed the chat
    if (records.length === 0) {
      await memoryManager.seedChatHistory(kaki.seed, "\n\n", kakiKey);
    }

    // Add the same prompt to VectorDB
    await memoryManager.writeToHistory("User: " + prompt + "\n", kakiKey);

    // Read past history
    const recentChatHistory = await memoryManager.readLatestHistory(kakiKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      kaki_file_name
    );

    // find relevant history, more info for AI to be more precise
    let relevantHistory = "";

    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    const { handlers } = LangChainStream();

    //Create model
    const model = new Replicate({
      model:
        // "a16z-infra/llama-2-13b-chat:9dff94b1bed5af738655d4a7cbcdcde2bd503aa85c94334fe1f42af7f3dd5ee3", // Model from replicate
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5", // Model from replicate
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    model.verbose = true; // add logs

    const resp = String(
      await model
        .call(
          `
          ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${kaki.name}: prefix. 
  
          ${kaki.instructions}
  
          Below are relevant details about ${kaki.name}'s past and the conversation you are in.
          ${relevantHistory}
  
  
          ${recentChatHistory}\n${kaki.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), kakiKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);

    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), kakiKey);
      await prismadb.kaki.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(s);
  } catch (err) {
    console.log("[CHAT_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
