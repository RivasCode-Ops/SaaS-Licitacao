import { NextResponse } from "next/server"
import { verifyOAuthState, githubExchangeCode, setSession } from "@saas/auth"
import { db, accounts, users } from "@saas/db"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(new URL("/login/sign-in?error=oauth_invalid", request.url))
  }

  const valid = await verifyOAuthState(state, "github")
  if (!valid) {
    return NextResponse.redirect(new URL("/login/sign-in?error=oauth_state", request.url))
  }

  try {
    const { origin } = new URL(request.url)
    const ghUser = await githubExchangeCode(code, origin)

    const existing = await db.query.accounts.findFirst({
      where: (a, { and, eq: eq2 }) =>
        and(eq2(a.provider, "github"), eq2(a.providerAccountId, ghUser.id)),
      with: { user: true },
    })

    if (existing) {
      if (!existing.user.active)
        return NextResponse.redirect(new URL("/login/sign-in?error=account_inactive", request.url))
      await setSession({
        id: existing.user.id,
        email: existing.user.email,
        name: existing.user.name,
        organId: existing.user.organId ?? 1,
        supplierId: existing.user.supplierId,
      })
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    const userByEmail = await db.query.users.findFirst({
      where: eq(users.email, ghUser.email),
    })

    if (!userByEmail) {
      return NextResponse.redirect(new URL("/login/sign-in?error=oauth_no_account", request.url))
    }

    if (!userByEmail.active) {
      return NextResponse.redirect(new URL("/login/sign-in?error=account_inactive", request.url))
    }

    await db.insert(accounts).values({
      userId: userByEmail.id,
      provider: "github",
      providerAccountId: ghUser.id,
    })

    await setSession({
      id: userByEmail.id,
      email: userByEmail.email,
      name: userByEmail.name,
      organId: userByEmail.organId ?? 1,
      supplierId: userByEmail.supplierId,
    })

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch {
    return NextResponse.redirect(new URL("/login/sign-in?error=oauth_failed", request.url))
  }
}
