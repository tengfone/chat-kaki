"use client";

import { ChatHeader } from "@/components/chat-header";
import { Kaki, Message } from "@prisma/client";

interface ChatClientProps {
    kaki: Kaki & {
        messages: Message[];
        _count: {
            messages: number;
        }
    }
}

export const ChatClient = ({ kaki }: ChatClientProps) => {
    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader kaki={kaki} />
        </div>
    )
}