import { describe, expect, it } from "vitest"
import { ProfileSchema } from "./schema"
import { defaultProfile, isProfileEmpty } from "./default-profile"

describe("defaultProfile", () => {
  it("validates against ProfileSchema", () => {
    const result = ProfileSchema.safeParse(defaultProfile())
    expect(result.success).toBe(true)
  })

  it("has empty identity fields", () => {
    const p = defaultProfile()
    expect(p.identity.fullName).toBe("")
    expect(p.identity.email).toBe("")
  })

  it("returns a fresh object each call (no shared references)", () => {
    const a = defaultProfile()
    const b = defaultProfile()
    a.identity.fullName = "Ada"
    expect(b.identity.fullName).toBe("")
    a.work.history.push({ title: "x", company: "y", start: "2020-01-01" })
    expect(b.work.history).toHaveLength(0)
  })
})

describe("isProfileEmpty", () => {
  it("returns true for a default profile", () => {
    expect(isProfileEmpty(defaultProfile())).toBe(true)
  })

  it("returns false once fullName is set", () => {
    const p = defaultProfile()
    p.identity.fullName = "Ada"
    expect(isProfileEmpty(p)).toBe(false)
  })

  it("returns false once an email is set", () => {
    const p = defaultProfile()
    p.identity.email = "ada@example.com"
    expect(isProfileEmpty(p)).toBe(false)
  })
})
