import {
  MESSAGE_RUN_FILL,
  type RunFillMessage,
  type RunFillResponse
} from "~lib/extension-messages"
import { runFillOnActiveTab } from "./fill-runner"
import { countFill, INSTALLED_AT_KEY, updateUninstallUrl } from "./uninstall-url"

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    void chrome.storage.local
      .set({ [INSTALLED_AT_KEY]: Date.now() })
      .then(updateUninstallUrl)
    chrome.runtime.openOptionsPage()
    return
  }
  void updateUninstallUrl()
})

chrome.runtime.onStartup.addListener(() => {
  void updateUninstallUrl()
})

chrome.runtime.onMessage.addListener((message: RunFillMessage, _sender, sendResponse) => {
  if (message?.type !== MESSAGE_RUN_FILL) return false

  void (async () => {
    try {
      const response = await runFillOnActiveTab(message.profile)
      if (response.ok) void countFill()
      sendResponse(response)
    } catch {
      sendResponse({
        message: "Could not fill this form. Please try again.",
        ok: false
      } satisfies RunFillResponse)
    }
  })()

  return true
})

void updateUninstallUrl()

console.log("[filler] background service worker booted")

export {}
