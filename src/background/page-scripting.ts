import type {
  ExtractedField,
  FillInstruction,
  FillRequest,
  PageContext,
  UserProfile
} from "~lib/fill-schemas"
import { applyInstructionsInPage, collectFieldsInPage } from "./page-functions"

type FrameInfo = {
  frameId: number
  url?: string
}

export async function collectFillRequestFromPage(
  profile: UserProfile,
  tabId: number
): Promise<FillRequest> {
  const frames = await getAllFrames(tabId)
  const responses = await Promise.allSettled(
    frames.map(async (frame) => {
      const [result] = await chrome.scripting.executeScript({
        args: [frame.frameId, frame.url],
        func: collectFieldsInPage,
        target: { frameIds: [frame.frameId], tabId }
      })

      return result?.result
    })
  )

  const successfulResponses = responses.flatMap((response) =>
    response.status === "fulfilled" && response.value?.ok ? [response.value] : []
  )
  const topPage =
    successfulResponses.find((response) => response.frameId === 0)?.page ??
    ({
      headings: [],
      title: "",
      url: ""
    } satisfies PageContext)

  return {
    fields: successfulResponses.flatMap((response) => response.fields),
    page: topPage,
    profile
  }
}

export async function applyInstructionsToPage(
  tabId: number,
  instructions: FillInstruction[],
  fields: ExtractedField[]
) {
  const frameByField = new Map(fields.map((field) => [field.id, field.frameId]))
  const grouped = new Map<number | undefined, FillInstruction[]>()

  for (const instruction of instructions) {
    const frameId = frameByField.get(instruction.fieldId)
    const existing = grouped.get(frameId) ?? []
    existing.push(instruction)
    grouped.set(frameId, existing)
  }

  const responses = await Promise.allSettled(
    Array.from(grouped.entries()).map(async ([frameId, frameInstructions]) => {
      const [result] = await chrome.scripting.executeScript({
        args: [frameInstructions],
        func: applyInstructionsInPage,
        target: { frameIds: [frameId ?? 0], tabId }
      })

      return result?.result
    })
  )

  return responses.reduce(
    (summary, response) => {
      if (response.status !== "fulfilled" || !response.value?.ok) {
        return summary
      }

      return {
        filled: summary.filled + response.value.filled,
        skipped: summary.skipped + response.value.skipped
      }
    },
    { filled: 0, skipped: 0 }
  )
}

function getAllFrames(tabId: number) {
  return new Promise<FrameInfo[]>((resolve) => {
    chrome.webNavigation.getAllFrames({ tabId }, (frames) => {
      resolve(
        frames?.map((frame) => ({ frameId: frame.frameId, url: frame.url })) ?? [
          { frameId: 0 }
        ]
      )
    })
  })
}
