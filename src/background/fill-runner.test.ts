import { beforeEach, describe, expect, it, vi } from "vitest"
import { runFillOnActiveTab, runFillOnTab } from "./fill-runner"

const mocks = vi.hoisted(() => ({
  applyInstructionsToPage: vi.fn(),
  collectFillRequestFromPage: vi.fn(),
  getActiveTabId: vi.fn(),
  validateFillInstructions: vi.fn()
}))

vi.mock("~lib/tab-frames", () => ({
  getActiveTabId: mocks.getActiveTabId
}))

vi.mock("./page-scripting", () => ({
  applyInstructionsToPage: mocks.applyInstructionsToPage,
  collectFillRequestFromPage: mocks.collectFillRequestFromPage
}))

vi.mock("~lib/fill-plan-validation", () => ({
  validateFillInstructions: mocks.validateFillInstructions
}))

const profile = {
  sections: [
    {
      fields: [{ id: "name", label: "Name", value: "Ada" }],
      id: "personal",
      title: "Personal"
    }
  ]
}

describe("background fill runner", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal("fetch", vi.fn())
  })

  it("collects fields in the page, calls the fill API, and applies returned instructions", async () => {
    const fields = [{ id: "field-1", tagName: "input" }]
    const fillRequest = {
      fields,
      page: { headings: [], title: "Application", url: "https://example.com" },
      profile
    }
    const instructions = [
      {
        action: "setValue",
        confidence: "high",
        fieldId: "field-1",
        value: "Ada"
      }
    ]

    mocks.collectFillRequestFromPage.mockResolvedValue(fillRequest)
    mocks.validateFillInstructions.mockReturnValue(instructions)
    mocks.applyInstructionsToPage.mockResolvedValue({ filled: 1, skipped: 0 })
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ fields: instructions }),
      ok: true
    } as Response)

    const result = await runFillOnTab(profile, 42)

    expect(fetch).toHaveBeenCalledOnce()
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toMatch(/\/api\/fill$/)
    expect(init).toEqual({
      body: JSON.stringify(fillRequest),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    })
    expect(mocks.applyInstructionsToPage).toHaveBeenCalledWith(
      42,
      instructions,
      fields
    )
    expect(result).toEqual({
      filled: 1,
      message: "Filled 1 fields, skipped 0.",
      ok: true,
      skipped: 0
    })
  })

  it("does not call the fill API when no supported fields are found", async () => {
    mocks.collectFillRequestFromPage.mockResolvedValue({
      fields: [],
      page: { headings: [], title: "Home", url: "https://example.com" },
      profile
    })

    const result = await runFillOnTab(profile, 42)

    expect(fetch).not.toHaveBeenCalled()
    expect(mocks.applyInstructionsToPage).not.toHaveBeenCalled()
    expect(result).toEqual({
      filled: 0,
      message: "No visible supported fields found.",
      ok: true,
      skipped: 0
    })
  })

  it("returns an error response when there is no active tab", async () => {
    mocks.getActiveTabId.mockResolvedValue(undefined)

    await expect(runFillOnActiveTab(profile)).resolves.toEqual({
      message: "No active tab found.",
      ok: false
    })
  })
})
