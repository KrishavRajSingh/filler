import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  countLongAnswers,
  fillSummaryMessage,
  runFillOnActiveTab,
  runFillOnTab
} from "./fill-runner"

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
    mocks.applyInstructionsToPage.mockResolvedValue({ filled: 1, guessed: 0, skipped: 0 })
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
      guessed: 0,
      longAnswers: 0,
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
      guessed: 0,
      longAnswers: 0,
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

  it("counts only filled textareas with a written answer as long answers", () => {
    const fields = [
      { id: "why", tagName: "textarea" as const },
      { id: "short", tagName: "textarea" as const },
      { id: "name", tagName: "input" as const }
    ]
    const longValue = "I want this role because I have shipped hiring tools."

    expect(
      countLongAnswers(
        [
          { action: "setValue", confidence: "medium", fieldId: "why", value: longValue },
          { action: "setValue", confidence: "high", fieldId: "short", value: "Yes" },
          { action: "setValue", confidence: "high", fieldId: "name", value: longValue }
        ],
        fields
      )
    ).toBe(1)
  })

  it("tells the user how many filled answers are guesses", () => {
    expect(fillSummaryMessage({ filled: 5, guessed: 2, skipped: 1 })).toBe(
      "Filled 5 fields, 2 are guesses to check, skipped 1."
    )
    expect(fillSummaryMessage({ filled: 3, guessed: 1, skipped: 0 })).toBe(
      "Filled 3 fields, 1 is a guess to check, skipped 0."
    )
  })
})
