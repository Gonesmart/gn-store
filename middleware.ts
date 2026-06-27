import { NextRequest, NextResponse } from "next/server";
import type { Session } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  let session: Session | null = null;

  try {
    const res = await fetch(
      new URL("/api/auth/get-session", request.nextUrl.origin).toString(),
      {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      }
    );
    if (res.ok) {
      session = (await res.json()) as Session;
    }
  } catch {
    // Network error — treat as unauthenticated
  }

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAccount = path.startsWith("/account");

  if (!session && (isAdmin || isAccount)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAdmin && (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
