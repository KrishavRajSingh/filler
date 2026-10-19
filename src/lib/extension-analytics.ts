// Umami's script can't run in an extension page (MV3 blocks remote code), so
// the popup posts events to Umami's collect endpoint directly.
const UMAMI_SEND_URL = "https://cloud.umami.is/api/send"
const UMAMI_WEBSITE_ID =
  process.env.PLASMO_PUBLIC_UMAMI_WEBSITE_ID ??
  "e07db633-ceea-4cf5-b14f-0470d07a92d6"

export type ExtensionEvent = "pass_click" | "pass_offer_shown"

export function trackExtensionEvent(
  name: ExtensionEvent,
  data?: Record<string, string | number>
): void {
  const payload = {
    payload: {
      data,
      hostname: "filler.live",
      language: navigator.language,
      name,
      screen: `${screen.width}x${screen.height}`,
      title: "Filler extension popup",
      url: "/extension/popup",
      website: UMAMI_WEBSITE_ID
    },
    type: "event"
  }

  fetch(UMAMI_SEND_URL, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  }).catch(() => {
    // Analytics must never break the popup.
  })
}
