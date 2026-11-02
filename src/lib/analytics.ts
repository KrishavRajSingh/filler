declare global {
  interface Window {
    umami?: {
      track: (
        event: string,
        data?: Record<string, string | number | boolean>
      ) => void
    }
  }
}

export type AnalyticsEvent =
  | "add_to_chrome"
  | "demo_replay"
  | "demo_video_view"
  | "form_cta_shown"
  | "mobile_install_copy_link"
  | "mobile_install_email_submit"
  | "mobile_install_modal_open"
  | "pass_buy_click"
  | "pass_click"
  | "pass_email_submit"
  | "time_sheet_change"
  | "uninstall_note"
  | "uninstall_reason"
  | "uninstalled"
  | "waitlist_submit"

export function trackEvent(
  name: AnalyticsEvent,
  data?: Record<string, string>
): void {
  if (typeof window === "undefined") {
    return
  }

  window.umami?.track(name, data)
}

// Sends once Umami's script has loaded (polls up to timeoutMs). For events fired on page
// load, where window.umami may not exist yet and trackEvent would drop them silently.
export function trackEventWhenReady(
  name: AnalyticsEvent,
  data?: Record<string, string>,
  timeoutMs = 5000
): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const started = Date.now()
  const attempt = () => {
    if (window.umami) {
      window.umami.track(name, data)
      return
    }
    if (Date.now() - started < timeoutMs) {
      timer = setTimeout(attempt, 250)
    }
  }
  attempt()

  return () => clearTimeout(timer)
}

export function getUmamiConfig(): {
  scriptUrl: string
  websiteId: string
} | null {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  if (!websiteId) {
    return null
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_UMAMI_URL ?? "https://cloud.umami.is"
  ).replace(/\/$/, "")

  return {
    scriptUrl: `${baseUrl}/script.js`,
    websiteId
  }
}
