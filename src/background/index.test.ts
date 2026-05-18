import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@plasmohq/storage", () => ({
  Storage: vi.fn()
}))

vi.mock("./profile-store", () => {
  throw new Error("background service worker must not load the profile store")
})

describe("background install handling", () => {
  const addListener = vi.fn()
  const openOptionsPage = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("chrome", {
      runtime: {
        OnInstalledReason: {
          INSTALL: "install",
          UPDATE: "update"
        },
        onInstalled: {
          addListener
        },
        openOptionsPage
      }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("opens the options page after the extension is installed", async () => {
    await import("./index")

    expect(addListener).toHaveBeenCalledOnce()

    const [[onInstalled]] = addListener.mock.calls
    onInstalled({ reason: chrome.runtime.OnInstalledReason.INSTALL })

    expect(openOptionsPage).toHaveBeenCalledOnce()
  })
})
