import { describe, expect, it, vi } from "vitest"
import { createProfileStore, PROFILE_KEY } from "./profile-store"
import { defaultProfile } from "~shared/default-profile"

function makeFakeStorage() {
  const data = new Map<string, unknown>()
  return {
    get: vi.fn(async (k: string) => data.get(k)),
    set: vi.fn(async (k: string, v: unknown) => {
      data.set(k, v)
    }),
    remove: vi.fn(async (k: string) => {
      data.delete(k)
    }),
    watch: vi.fn(),
    _data: data
  }
}

describe("createProfileStore", () => {
  it("returns defaultProfile when nothing is stored", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    const p = await store.get()
    expect(p).toEqual(defaultProfile())
  })

  it("persists what was set and returns it on next get", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    const next = defaultProfile()
    next.identity.fullName = "Ada"
    await store.set(next)
    const round = await store.get()
    expect(round.identity.fullName).toBe("Ada")
  })

  it("returns defaultProfile if stored data fails schema validation", async () => {
    const fake = makeFakeStorage()
    fake._data.set(PROFILE_KEY, { totally: "wrong" })
    const store = createProfileStore(fake as never)
    const p = await store.get()
    expect(p).toEqual(defaultProfile())
  })

  it("clear() removes the stored profile", async () => {
    const fake = makeFakeStorage()
    const store = createProfileStore(fake as never)
    const next = defaultProfile()
    next.identity.fullName = "Ada"
    await store.set(next)
    await store.clear()
    expect(fake.remove).toHaveBeenCalledWith(PROFILE_KEY)
  })

  it("update() shallow-merges into a top-level section", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    await store.update("identity", { fullName: "Ada", email: "ada@example.com" })
    const p = await store.get()
    expect(p.identity.fullName).toBe("Ada")
    expect(p.identity.email).toBe("ada@example.com")
    expect(p.identity.location).toEqual({})
  })
})
