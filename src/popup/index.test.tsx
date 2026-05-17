import { describe, expect, it } from "vitest"
import { PopupApp } from "~components/popup-app"

describe("popup entrypoint", () => {
  it("exports the React component Plasmo renders", async () => {
    const popupModule = (await import("./index")) as Record<string, unknown>

    expect(popupModule.default).toBe(PopupApp)
  })
})
