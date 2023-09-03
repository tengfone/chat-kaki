// "use client is used to declare a boundary between a Server and Client Component modules. 
// This means that by defining a "use client" in a file, all other modules imported into it, 
// including child components, are considered part of the client bundle - and will be rendered by React on the client.
// aka the client is rendering this instead of server
"use client";

import { Menu, Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link"
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

// From CN in lib/utils.ts (init by the library)
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./mobile-sidebar";


const font = Poppins({
    weight: "600", subsets: ["latin"]
})

export const Navbar = () => {
    return (
        <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
            <div className="flex items-center">
                <MobileSidebar />
                <Link href="/">
                    {/* The cn function tells the compiler, this is the main tailwind but i want you to have a dynamic classname (font by poppin) */}
                    <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary", font.className)}>
                        Chat-Kaki
                    </h1>
                </Link>
            </div>
            <div className="flex items-center gap-x-3">
                <Button variant="premium" size="sm">
                    Upgrade
                    <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
                </Button>
                <ModeToggle />
                <UserButton afterSignOutUrl="/"/>
            </div>
        </div>
    )
}