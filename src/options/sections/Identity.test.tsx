import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Identity } from "./Identity"
import { ProfileStoreContext } from "../use-profile"
import { defaultProfile } from "~shared/default-profile"
import type { ProfileStore } from "~background/profile-store"
import type { Profile } from "~shared/schema"

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

function renderWithStore(store: ProfileStore) {
  return render(
    <ProfileStoreContext.Provider value={store}>
      <Identity />
    </ProfileStoreContext.Provider>
  )
}

describe("Identity section", () => {
  it("renders all primary identity inputs", async () => {
    renderWithStore(makeFakeStore())
    expect(await screen.findByLabelText(/Full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/GitHub/i)).toBeInTheDocument()
  })

  it("autosaves the full name on blur", async () => {
    const store = makeFakeStore()
    renderWithStore(store)
    const input = await screen.findByLabelText(/Full name/i)
    await userEvent.type(input, "Ada Lovelace")
    await userEvent.tab()
    expect(store.update).toHaveBeenCalledWith(
      "identity",
      expect.objectContaining({ fullName: "Ada Lovelace" })
    )
  })

  it("autosaves a nested link (linkedin) on blur", async () => {
    const store = makeFakeStore()
    renderWithStore(store)
    const li = await screen.findByLabelText(/LinkedIn/i)
    await userEvent.type(li, "https://linkedin.com/in/ada")
    await userEvent.tab()
    const calls = (store.update as ReturnType<typeof vi.fn>).mock.calls
    const last = calls[calls.length - 1]
    expect(last[0]).toBe("identity")
    expect(last[1].links).toMatchObject({ linkedin: "https://linkedin.com/in/ada" })
  })
})
