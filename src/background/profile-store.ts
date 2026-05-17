import type { Storage } from "@plasmohq/storage"
import { ProfileSchema, type Profile } from "~shared/schema"
import { defaultProfile } from "~shared/default-profile"

export const PROFILE_KEY = "filler.profile.v1"

export type ProfileStore = {
  get: () => Promise<Profile>
  set: (p: Profile) => Promise<void>
  clear: () => Promise<void>
  update: <K extends keyof Profile>(section: K, patch: Partial<Profile[K]>) => Promise<Profile>
}

export function createProfileStore(storage: Storage): ProfileStore {
  async function get(): Promise<Profile> {
    const raw = await storage.get(PROFILE_KEY)
    if (raw === undefined || raw === null) return defaultProfile()
    const parsed = ProfileSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn("[filler] stored profile failed schema validation, resetting")
      return defaultProfile()
    }
    return parsed.data
  }

  async function set(p: Profile): Promise<void> {
    const parsed = ProfileSchema.parse(p)
    await storage.set(PROFILE_KEY, parsed)
  }

  async function clear(): Promise<void> {
    await storage.remove(PROFILE_KEY)
  }

  async function update<K extends keyof Profile>(
    section: K,
    patch: Partial<Profile[K]>
  ): Promise<Profile> {
    const current = await get()
    const next = {
      ...current,
      [section]: { ...(current[section] as object), ...(patch as object) }
    } as Profile
    await set(next)
    return next
  }

  return { get, set, clear, update }
}
