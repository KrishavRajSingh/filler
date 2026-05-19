import {
  MESSAGE_RUN_FILL,
  type RunFillMessage,
  type RunFillResponse
} from "~lib/extension-messages"
import { runFillOnActiveTab } from "./fill-runner"

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage()
  }
})

chrome.runtime.onMessage.addListener((message: RunFillMessage, _sender, sendResponse) => {
  if (message?.type !== MESSAGE_RUN_FILL) return false

  void (async () => {
    try {
      sendResponse(await runFillOnActiveTab(message.profile))
    } catch {
      sendResponse({
        message: "Could not fill this form. Please try again.",
        ok: false
      } satisfies RunFillResponse)
    }
  })()

  return true
})

console.log("[filler] background service worker booted")

export {}
