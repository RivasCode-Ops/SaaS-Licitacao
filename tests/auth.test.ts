import { describe, it, expect } from "vitest"
import { hashPassword } from "@/lib/auth/session"

describe("hashPassword", () => {
  it("returns a hash for a valid password", async () => {
    const hash = await hashPassword("123456")
    expect(hash).toBeTruthy()
    expect(typeof hash).toBe("string")
    expect(hash).not.toBe("123456")
  })

  it("produces different hashes for the same password", async () => {
    const hash1 = await hashPassword("abc")
    const hash2 = await hashPassword("abc")
    expect(hash1).not.toBe(hash2)
  })

  it("handles empty password", async () => {
    const hash = await hashPassword("")
    expect(hash).toBeTruthy()
  })
})
