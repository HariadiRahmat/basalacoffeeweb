import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Block legacy unauthenticated API routes — inventory uses authenticated Firestore client calls. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
