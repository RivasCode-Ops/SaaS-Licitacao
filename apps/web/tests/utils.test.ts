import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("removes conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })

  it("handles empty inputs", () => {
    expect(cn()).toBe("")
  })

  it("handles undefined values", () => {
    expect(cn("a", undefined, "b")).toBe("a b")
  })
})
