import type { PlasmoCSConfig } from "plasmo"

import {
  MESSAGE_APPLY_FILL,
  MESSAGE_EXTRACT_FIELDS,
  type ApplyFillMessage,
  type ExtractFieldsMessage
} from "~lib/extension-messages"
import { applyFillInstructions } from "~lib/form-fill"
import {
  extractFieldsFromDocument,
  extractPageContext
} from "~lib/form-extraction"

export const config: PlasmoCSConfig = {
  all_frames: true,
  matches: ["http://*/*", "https://*/*"],
  run_at: "document_idle"
}

chrome.runtime.onMessage.addListener(
  (message: ExtractFieldsMessage | ApplyFillMessage, _sender, sendResponse) => {
    if (message.type === MESSAGE_EXTRACT_FIELDS) {
      const frameId = message.frameId
      const frameUrl = window.location.href

      sendResponse({
        ok: true,
        fields: extractFieldsFromDocument(document, { frameId, frameUrl }),
        frameId,
        frameUrl,
        page: extractPageContext(document, frameUrl)
      })

      return true
    }

    if (message.type === MESSAGE_APPLY_FILL) {
      sendResponse({
        ok: true,
        ...applyFillInstructions(document, message.instructions)
      })

      return true
    }

    return false
  }
)
