import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";

interface ChatIdPageProps {
    params: { // params and not search params because we are not using search params in this page, its not a query
        chatId: string;
    }
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
    const { userId } = auth()

    if (!userId) {
        return redirectToSignIn();
    }

    const kaki = await prismadb.kaki.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc'
                },
                where: {
                    userId,
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })

    if (!kaki) { // check if the kaki exist
        return redirect("/")
    }

    return (
        <ChatClient kaki={kaki} />
    )
}

export default ChatIdPage;