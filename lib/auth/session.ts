import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const SALT_ROUNDS = 10
const key = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS)
}

export async function comparePasswords(
  plainText: string,
  hashedPassword: string
) {
  return compare(plainText, hashedPassword)
}

type SessionData = {
  user: { id: number; email: string; name: string }
  expires: string
}

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key)
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload as unknown as SessionData
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return verifyToken(session)
}

export async function setSession(user: {
  id: number
  email: string
  name: string
}) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session: SessionData = {
    user: { id: user.id, email: user.email, name: user.name },
    expires: expiresInOneDay.toISOString(),
  }
  const encryptedSession = await signToken(session)
  const cookieStore = await cookies()
  cookieStore.set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
