import { UserButton } from "@clerk/nextjs"

const RootPage = () => {
    return (
        <div>
            <UserButton afterSignOutUrl="/" />
            Root page (PROTECTED)
        </div>
    )
}

export default RootPage