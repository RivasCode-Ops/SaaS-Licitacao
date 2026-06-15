import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const key = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("session")

  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) return NextResponse.redirect(new URL("/login", request.url))

    try {
      const { payload } = await jwtVerify(sessionCookie.value, key, {
        algorithms: ["HS256"],
      })
      const user = payload.user as { organId?: number } | undefined
      if (!user?.organId) throw new Error("missing organId")
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
