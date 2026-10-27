import type {
  ExtractedField,
  FillInstruction,
  UserProfile
} from "~lib/fill-schemas"
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
      guessed: 0,
      jobPage: false,
      longAnswers: 0,
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
    jobPage: isJobApplicationPage(fillRequest.page.url, fillRequest.fields),
    longAnswers: countLongAnswers(instructions, fillRequest.fields),
    message: fillSummaryMessage(summary),
    ok: true
  }
}

export function fillSummaryMessage({
  filled,
  guessed,
  skipped
}: {
  filled: number
  guessed: number
  skipped: number
}): string {
  const guesses =
    guessed === 0
      ? ""
      : guessed === 1
        ? ", 1 is a guess to check"
        : `, ${guessed} are guesses to check`
  return `Filled ${filled} fields${guesses}, skipped ${skipped}.`
}

// Long written answers ("why this role?") are where the Job Hunt Pass offer shows.
export function countLongAnswers(
  instructions: FillInstruction[],
  fields: ExtractedField[]
): number {
  const textareaIds = new Set(
    fields.filter((field) => field.tagName === "textarea").map((field) => field.id)
  )

  return instructions.filter(
    (instruction) =>
      instruction.action === "setValue" &&
      textareaIds.has(instruction.fieldId) &&
      (instruction.value ?? "").trim().length >= 40
  ).length
}

const atsHostPattern =
  /(^|\.)(greenhouse\.io|lever\.co|ashbyhq\.com|myworkdayjobs\.com|smartrecruiters\.com|workable\.com|jobvite\.com|icims\.com)$/i
const applicationFieldPattern = /\b(resume|résumé|cv|cover letter)\b/i

// Job applications also show the Job Hunt Pass offer, even without a long answer.
// File inputs are never extracted, so resume fields are found by their text.
export function isJobApplicationPage(
  pageUrl: string,
  fields: ExtractedField[]
): boolean {
  const hosts = [pageUrl, ...fields.map((field) => field.frameUrl ?? "")]
    .map(hostnameOf)
    .filter(Boolean)
  if (hosts.some((host) => atsHostPattern.test(host))) return true

  return fields.some((field) =>
    applicationFieldPattern.test(
      [field.labelText, field.ariaLabel, field.placeholder, field.nearbyText]
        .filter(Boolean)
        .join(" ")
    )
  )
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ""
  }
}
