import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const protectedRoutes = ["/dashboard"]
const key = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("session")
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    if (!sessionCookie) {
      const signInUrl = new URL("/login/sign-in", request.url)
      signInUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(signInUrl)
    }

    try {
      const { payload } = await jwtVerify(sessionCookie.value, key, { algorithms: ["HS256"] })
      const user = payload.user as { organId?: number } | undefined
      if (!user?.organId) throw new Error("missing organId")
    } catch {
      const signInUrl = new URL("/login/sign-in", request.url)
      signInUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
}
