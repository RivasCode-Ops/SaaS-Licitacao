import { NextResponse } from "next/server"
import { setOAuthState, googleAuthURL } from "@saas/auth"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const state = await setOAuthState("google")
  return NextResponse.redirect(googleAuthURL(origin, state))
}
