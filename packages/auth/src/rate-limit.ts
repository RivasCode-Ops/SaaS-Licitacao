import { headers } from "next/headers"

// ─── In-memory fallback (dev / sem Redis) ─────────────────────────

const memoryStore = new Map<string, number[]>()
const MEMORY_WINDOW_MS = 60_000

function memoryCleanup() {
  const now = Date.now()
  for (const [key, timestamps] of memoryStore) {
    const valid = timestamps.filter((t) => now - t < MEMORY_WINDOW_MS)
    if (valid.length) memoryStore.set(key, valid)
    else memoryStore.delete(key)
  }
}

async function memoryRateLimit(key: string, limit: number): Promise<boolean> {
  const now = Date.now()
  const timestamps = memoryStore.get(key) ?? []
  const valid = timestamps.filter((t) => now - t < MEMORY_WINDOW_MS)
  if (valid.length >= limit) return false
  valid.push(now)
  memoryStore.set(key, valid)
  if (memoryStore.size > 10_000) memoryCleanup()
  return true
}

// ─── Upstash Redis (produção) ─────────────────────────────────────

let upstashRatelimit: import("@upstash/ratelimit").Ratelimit | null = null

async function getUpstashRatelimit() {
  if (upstashRatelimit) return upstashRatelimit
  try {
    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis } = await import("@upstash/redis")
    const redis = Redis.fromEnv()
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit",
    })
    return upstashRatelimit
  } catch {
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────

async function getIP(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    h.get("x-vercel-forwarded-for") ??
    "127.0.0.1"
  )
}

export async function rateLimitByIP(limit = 5, window = "60 s") {
  const ip = await getIP()
  const key = `ip:${ip}`

  const rl = await getUpstashRatelimit()
  if (rl) {
    const result = await rl.limit(key)
    return result.success
  }

  return memoryRateLimit(key, limit)
}

export async function rateLimitByUser(
  userId: number,
  limit = 10,
  window = "60 s"
) {
  const key = `user:${userId}`

  const rl = await getUpstashRatelimit()
  if (rl) {
    const result = await rl.limit(key)
    return result.success
  }

  return memoryRateLimit(key, limit)
}

export async function rateLimitByKey(
  key: string,
  limit = 10,
  window = "60 s"
) {
  const rl = await getUpstashRatelimit()
  if (rl) {
    const result = await rl.limit(key)
    return result.success
  }

  return memoryRateLimit(key, limit)
}
