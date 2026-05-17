import type {
  ExtractedField,
  FillInstruction,
  FillRequest,
  PageContext,
  UserProfile
} from "./fill-schemas"
import {
  MESSAGE_APPLY_FILL,
  MESSAGE_EXTRACT_FIELDS,
  type ApplyFillResponse,
  type ExtractFieldsResponse
} from "./extension-messages"

type FrameInfo = {
  frameId: number
}

export async function getActiveTabId() {
  const tabs = await queryTabs({ active: true, currentWindow: true })
  return tabs[0]?.id
}

export async function collectFillRequest(
  profile: UserProfile,
  tabId: number
): Promise<FillRequest> {
  const frames = await getAllFrames(tabId)
  const responses = await Promise.allSettled(
    frames.map((frame) =>
      sendMessageToFrame<ExtractFieldsResponse>(tabId, frame.frameId, {
        frameId: frame.frameId,
        type: MESSAGE_EXTRACT_FIELDS
      })
    )
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

export async function applyInstructionsToFrames(
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
    Array.from(grouped.entries()).map(([frameId, frameInstructions]) =>
      sendMessageToFrame<ApplyFillResponse>(tabId, frameId ?? 0, {
        instructions: frameInstructions,
        type: MESSAGE_APPLY_FILL
      })
    )
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

function queryTabs(queryInfo: chrome.tabs.QueryInfo) {
  return new Promise<chrome.tabs.Tab[]>((resolve) => {
    chrome.tabs.query(queryInfo, resolve)
  })
}

function getAllFrames(tabId: number) {
  return new Promise<FrameInfo[]>((resolve) => {
    chrome.webNavigation.getAllFrames({ tabId }, (frames) => {
      resolve(frames?.map((frame) => ({ frameId: frame.frameId })) ?? [{ frameId: 0 }])
    })
  })
}

function sendMessageToFrame<TResponse>(
  tabId: number,
  frameId: number,
  message: unknown
) {
  return new Promise<TResponse>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, { frameId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve(response as TResponse)
    })
  })
}
