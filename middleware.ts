import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// to make public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/sign-in(.*)",
  "/subscribe(.*)",
  "/api/webhook(.*)",
  "/api/stats(.*)",
  "/api/check-subscription(.*)",
]);
const isSignRoute = createRouteMatcher(["/sign-up(.*)", "/sign-in(.*)"]);
const isResumeParser = createRouteMatcher(["/parser(.*)"]);
export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const { userId } = userAuth;
  const { pathname, origin } = req.nextUrl;
  if (pathname === "api/check-subscription") {
    return NextResponse.next();
  }

  if (!isPublicRoute(req) && !userId) {
    // check if public route and use sign in else redircct
    return NextResponse.redirect(new URL("/sign-in", origin));
  }

  if (isSignRoute(req) && userId) {
    return NextResponse.redirect(new URL("/subscribe", origin));
  }
  if (isResumeParser(req) && userId) {
    try {
      const response = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`
      );
      const data = await response.json();

      if (!data.subscriptionActive) {
        return NextResponse.redirect(
          new URL("/subscribe?error=inactive", origin)
        );

        // return NextResponse.redirect(new URL("/subscribe", origin));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/subscribe", origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
