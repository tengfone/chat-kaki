import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { kakiId: string } } // Need to reflects the slug
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.kakiId) {
      return new NextResponse("Kaki ID is Required", { status: 400 });
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing Required Fields", { status: 400 });
    }

    // Check subscription
    const isPro = await checkSubscription();

    if (!isPro) {
      return new NextResponse("Pro Subscription Required", { status: 403 });
    }

    const kaki = await prismadb.kaki.update({
      where: {
        id: params.kakiId,
        userId: user.id,
      },
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });
    return NextResponse.json(kaki);
  } catch (err) {
    console.log("[COMPANION_PATCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { kakiId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const kaki = await prismadb.kaki.delete({
      where: {
        userId,
        id: params.kakiId,
      },
    });

    return NextResponse.json(kaki);
  } catch (err) {
    console.log("[COMPANION_DELETE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
