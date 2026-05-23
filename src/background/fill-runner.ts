import type { UserProfile } from "~lib/fill-schemas"
import { validateFillInstructions } from "~lib/fill-plan-validation"
import { absoluteUrl } from "~lib/site"
import { getActiveTabId } from "~lib/tab-frames"
import type { RunFillResponse } from "~lib/extension-messages"
import { applyInstructionsToPage, collectFillRequestFromPage } from "./page-scripting"

const DEV_FILL_API_URL = "http://localhost:1947/api/fill"

const fillApiUrl =
  process.env.PLASMO_PUBLIC_FILL_API_URL ??
  (process.env.NODE_ENV === "production"
    ? absoluteUrl("/api/fill")
    : DEV_FILL_API_URL)

export async function runFillOnActiveTab(
  profile: UserProfile
): Promise<RunFillResponse> {
  const tabId = await getActiveTabId()
  if (!tabId) {
    return { message: "No active tab found.", ok: false }
  }

  return runFillOnTab(profile, tabId)
}

export async function runFillOnTab(
  profile: UserProfile,
  tabId: number
): Promise<RunFillResponse> {
  const fillRequest = await collectFillRequestFromPage(profile, tabId)
  if (fillRequest.fields.length === 0) {
    return {
      filled: 0,
      message: "No visible supported fields found.",
      ok: true,
      skipped: 0
    }
  }

  const response = await fetch(fillApiUrl, {
    body: JSON.stringify(fillRequest),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  })

  if (!response.ok) {
    throw new Error("Fill API failed")
  }

  const fillResponse = await response.json()
  const instructions = validateFillInstructions(
    fillResponse,
    new Set(fillRequest.fields.map((field) => field.id))
  )
  const summary = await applyInstructionsToPage(
    tabId,
    instructions,
    fillRequest.fields
  )

  return {
    ...summary,
    message: `Filled ${summary.filled} fields, skipped ${summary.skipped}.`,
    ok: true
  }
}
