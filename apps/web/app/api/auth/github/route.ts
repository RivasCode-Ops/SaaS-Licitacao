import { NextResponse } from "next/server"
import { setOAuthState, githubAuthURL } from "@saas/auth"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const state = await setOAuthState("github")
  return NextResponse.redirect(githubAuthURL(origin, state))
}
