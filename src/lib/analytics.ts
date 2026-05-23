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

export type AnalyticsEvent = "add_to_chrome" | "waitlist_submit"

export function trackEvent(
  name: AnalyticsEvent,
  data?: Record<string, string>
): void {
  if (typeof window === "undefined") {
    return
  }

  window.umami?.track(name, data)
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
