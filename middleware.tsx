import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Everything is protected except the auth pages and the Stripe webhook
// (same behaviour as the previous authMiddleware({ publicRoutes: ["/api/webhook"] })).
// See https://clerk.com/docs/references/nextjs/clerk-middleware
const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhook", // Remove authentication for webhook
]);
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return;

    // Keep returning 401 for unauthenticated API calls (authMiddleware did this)
    if (isApiRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(null, { status: 401 });
        }
        return;
    }

    // Redirect signed-out users to the sign-in page (authMiddleware did this for every
    // request type; auth.protect() would return 404 for non-HTML requests instead)
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
