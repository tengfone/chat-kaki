"use client";

import { Kaki } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ElementRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
    kaki: Kaki
    isLoading: boolean
    messages: ChatMessageProps[]
}

export const ChatMessages = ({
    messages = [],
    isLoading,
    kaki
}: ChatMessagesProps) => {

    // Allow auto scroll all the way down
    const scrollRef = useRef<ElementRef<"div">>(null)

    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false)
        }, 1000)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    // Allow auto scroll all the way down
    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                src={kaki.src}
                role="system"
                isLoading={fakeLoading}
                content={`Hello, I am ${kaki.name}, ${kaki.description}`}
            />
            {messages.map((message) => (
                <ChatMessage
                    role={message.role}
                    key={message.content}
                    content={message.content}
                    src={message.src}
                />
            ))}
            {isLoading && (
                <ChatMessage role="system" src={kaki.src} isLoading={true} />
            )}
            <div ref={scrollRef} />
        </div>
    )
}