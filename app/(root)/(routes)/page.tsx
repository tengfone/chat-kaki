import { Categories } from "@/components/categories";
import { Kakis } from "@/components/kakis";
import { SearchInput } from "@/components/search-input"
import prismadb from "@/lib/prismadb" // import this as a global var to access the db

interface RootPageProps {
    searchParams: { // convention nextJS
        categoryId: string;
        name: string;
    }
}

const RootPage = async ({ searchParams }: RootPageProps) => {

    const data = await prismadb.kaki.findMany({
        where: {
            categoryId: searchParams.categoryId,
            name: {
                search: searchParams.name
            }
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })

    const categories = await prismadb.category.findMany();

    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Kakis data={data} />
        </div>
    )
}

export default RootPage