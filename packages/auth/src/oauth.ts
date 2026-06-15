import { cookies } from "next/headers"

const STATE_COOKIE = "oauth_state"
const PROVIDER_COOKIE = "oauth_provider"

function base64URLEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url")
}

async function generateState(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return base64URLEncode(bytes)
}

export async function setOAuthState(provider: string): Promise<string> {
  const state = await generateState()
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
  cookieStore.set(PROVIDER_COOKIE, provider, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
  return state
}

export async function verifyOAuthState(
  state: string,
  provider: string
): Promise<boolean> {
  const cookieStore = await cookies()
  const storedState = cookieStore.get(STATE_COOKIE)?.value
  const storedProvider = cookieStore.get(PROVIDER_COOKIE)?.value
  cookieStore.delete(STATE_COOKIE)
  cookieStore.delete(PROVIDER_COOKIE)
  return storedState === state && storedProvider === provider
}

export function googleAuthURL(baseUrl: string, state: string): string {
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function googleExchangeCode(code: string, baseUrl: string) {
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  const tokens = await res.json()
  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  )
  return userRes.json() as Promise<{
    id: string
    email: string
    name: string
    picture?: string
  }>
}

export function githubAuthURL(baseUrl: string, state: string): string {
  const redirectUri = `${baseUrl}/api/auth/github/callback`
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function githubExchangeCode(code: string, baseUrl: string) {
  const redirectUri = `${baseUrl}/api/auth/github/callback`
  const res = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID ?? "",
        client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
      }),
    }
  )
  const tokens = await res.json()
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const user = await userRes.json()
  let email = user.email as string | null
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const emails = (await emailsRes.json()) as Array<{
      email: string
      primary: boolean
    }>
    email = emails.find((e) => e.primary)?.email ?? emails[0]?.email
  }
  return { id: String(user.id), email, name: user.name ?? user.login }
}
