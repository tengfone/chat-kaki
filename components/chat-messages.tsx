"use client";

import { Kaki } from "@prisma/client";
import { ChatMessage } from "./chat-message";

interface ChatMessagesProps {
    kaki: Kaki
    isLoading: boolean
    messages: any[]
}

export const ChatMessages = ({
    messages = [],
    isLoading,
    kaki
}: ChatMessagesProps) => {
    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                src={kaki.src}
                role="system"
                isLoading={isLoading}
                content={`Hello, I am ${kaki.name}, ${kaki.description}`}
            />
        </div>
    )
}