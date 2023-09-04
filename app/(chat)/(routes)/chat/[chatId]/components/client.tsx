"use client";

import { ChatHeader } from "@/components/chat-header";
import { Kaki, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCompletion } from "ai/react"
import { ChatForm } from "@/components/chat-form";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps {
    kaki: Kaki & {
        messages: Message[];
        _count: {
            messages: number;
        }
    }
}

export const ChatClient = ({ kaki }: ChatClientProps) => {

    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(kaki.messages)

    const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
        api: `/api/chat/${kaki.id}`,
        onFinish(prompt, completion) {
            const systemMessage: ChatMessageProps = { // AI Message object
                role: "system",
                content: completion
            }

            setMessages((current) => [...current, systemMessage])
            setInput("")

            router.refresh()
        }
    })

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input
        }

        setMessages((current) => [...current, userMessage])

        handleSubmit(e)
    }

    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader kaki={kaki} />
            <ChatMessages
                kaki={kaki}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit} />
        </div>
    )
}