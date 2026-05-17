import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ProfileStore } from "~background/profile-store"
import type { Profile } from "~shared/schema"

export const ProfileStoreContext = createContext<ProfileStore | null>(null)

export type UseProfileResult = {
  loaded: boolean
  profile: Profile | null
  update: <K extends keyof Profile>(section: K, patch: Partial<Profile[K]>) => Promise<void>
  clearAll: () => Promise<void>
  replace: (p: Profile) => Promise<void>
}

export function useProfile(): UseProfileResult {
  const store = useContext(ProfileStoreContext)
  if (!store) throw new Error("useProfile must be inside ProfileStoreContext.Provider")

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    store.get().then((p) => {
      if (!cancelled) {
        setProfile(p)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [store])

  const update = useCallback<UseProfileResult["update"]>(
    async (section, patch) => {
      const next = await store.update(section, patch)
      setProfile(next)
    },
    [store]
  )

  const clearAll = useCallback<UseProfileResult["clearAll"]>(async () => {
    await store.clear()
    const fresh = await store.get()
    setProfile(fresh)
  }, [store])

  const replace = useCallback<UseProfileResult["replace"]>(
    async (p) => {
      await store.set(p)
      setProfile(p)
    },
    [store]
  )

  return { loaded, profile, update, clearAll, replace }
}
