import prismadb from "@/lib/prismadb";
import { KakiForm } from "./components/kaki-form";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface KakiIdPageProps {
    params: {
        kakiId: string; // must be reflective of the next route
    }
}

const KakiIdPage = async ({
    params
}: KakiIdPageProps) => {

    const { userId } = auth()

    if (!userId) {
        return redirectToSignIn()
    }

    // todo: check subscription

    const kaki = await prismadb.kaki.findUnique({
        where: {
            id: params.kakiId,
            userId
        }
    })

    //This will check if the ID exist, if it doesnt (e.g url points to new, it will show a new page, else update page.)

    const categories = await prismadb.category.findMany();

    return (
        <KakiForm initialData={kaki} categories={categories} />
    )
}

export default KakiIdPage