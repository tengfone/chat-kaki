"use client";

import axios from "axios"
import { Kaki, Message } from "@prisma/client";
import { Button } from "./ui/button";
import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { BotAvatar } from "./bot-avatar";
import { useUser } from "@clerk/nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";

interface ChatHeaderProps {
    kaki: Kaki & {
        messages: Message[];
        _count: {
            messages: number;
        }
    }
}

export const ChatHeader = ({ kaki }: ChatHeaderProps) => {

    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast()

    const onDelete = async () => {
        try {
            await axios.delete(`/api/kaki/${kaki.id}`)
            toast({
                description: "Success"
            })
            router.refresh()
            router.push("/")
        } catch (err) {
            toast({
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
            <div className="flex gap-x-2 items-center">
                <Button onClick={() => router.back()} size="icon" variant="ghost">
                    <ChevronLeft className="w-8 h-8" />
                </Button>
                <BotAvatar src={kaki.src} />
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold">
                            {kaki.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MessagesSquare className="w-3 h-3 mr-1" />
                            {kaki._count.messages}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Created by {kaki.userName}
                    </p>
                </div>
            </div>

            {user?.id === kaki.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/kaki/${kaki.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

        </div>
    )
}