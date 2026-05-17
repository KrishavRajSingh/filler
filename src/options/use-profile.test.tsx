import { describe, expect, it, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useProfile, ProfileStoreContext } from "./use-profile"
import type { ProfileStore } from "~background/profile-store"
import { defaultProfile } from "~shared/default-profile"
import type { Profile } from "~shared/schema"
import { type ReactNode } from "react"

function makeFakeStore(initial: Profile = defaultProfile()): ProfileStore {
  let state = initial
  return {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Profile) => {
      state = p
    }),
    clear: vi.fn(async () => {
      state = defaultProfile()
    }),
    update: vi.fn(async (section, patch) => {
      state = {
        ...state,
        [section]: { ...(state[section] as object), ...(patch as object) }
      } as Profile
      return state
    })
  }
}

function wrapWith(store: ProfileStore) {
  return ({ children }: { children: ReactNode }) => (
    <ProfileStoreContext.Provider value={store}>
      {children}
    </ProfileStoreContext.Provider>
  )
}

describe("useProfile", () => {
  it("loads the default profile on mount", async () => {
    const store = makeFakeStore()
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.profile?.identity.fullName).toBe("")
  })

  it("update() mutates the profile section and persists", async () => {
    const store = makeFakeStore()
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => {
      await result.current.update("identity", { fullName: "Ada" })
    })
    expect(result.current.profile?.identity.fullName).toBe("Ada")
    expect(store.update).toHaveBeenCalledWith("identity", { fullName: "Ada" })
  })

  it("clearAll() resets profile to default", async () => {
    const initial = defaultProfile()
    initial.identity.fullName = "Ada"
    const store = makeFakeStore(initial)
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.profile?.identity.fullName).toBe("Ada"))
    await act(async () => {
      await result.current.clearAll()
    })
    expect(result.current.profile?.identity.fullName).toBe("")
  })
})
