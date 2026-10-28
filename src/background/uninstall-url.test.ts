import { describe, expect, it } from "vitest"

import { buildUninstallUrl } from "./uninstall-url"

describe("buildUninstallUrl", () => {
  it("sends version, fill count and days since install", () => {
    const url = new URL(
      buildUninstallUrl({
        fills: 3,
        installedAt: 0,
        now: 2.5 * 86_400_000,
        version: "0.0.9"
      })
    )

    expect(url.origin + url.pathname).toBe("https://filler.live/bye")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      days: "2",
      fills: "3",
      v: "0.0.9"
    })
  })

  it("leaves days out when the install date is unknown", () => {
    const url = new URL(buildUninstallUrl({ fills: 0, version: "0.0.9" }))

    expect(url.searchParams.has("days")).toBe(false)
  })
})
