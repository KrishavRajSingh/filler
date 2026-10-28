// Chrome opens this page when someone removes Filler, so we can ask why.
// It carries counts only, never profile data or pages.
const BYE_URL = "https://filler.live/bye"
const DAY_MS = 86_400_000

export const FILL_COUNT_KEY = "fillCount"
export const INSTALLED_AT_KEY = "installedAt"

export function buildUninstallUrl({
  fills,
  installedAt,
  now = Date.now(),
  version
}: {
  fills: number
  installedAt?: number
  now?: number
  version: string
}): string {
  const params = new URLSearchParams({ fills: String(fills), v: version })
  if (installedAt !== undefined) {
    params.set("days", String(Math.floor((now - installedAt) / DAY_MS)))
  }
  return `${BYE_URL}?${params}`
}

export async function updateUninstallUrl(): Promise<void> {
  const stored = await chrome.storage.local.get([FILL_COUNT_KEY, INSTALLED_AT_KEY])
  await chrome.runtime.setUninstallURL(
    buildUninstallUrl({
      fills: Number(stored[FILL_COUNT_KEY] ?? 0),
      installedAt: stored[INSTALLED_AT_KEY] as number | undefined,
      version: chrome.runtime.getManifest().version
    })
  )
}

export async function countFill(): Promise<void> {
  const stored = await chrome.storage.local.get(FILL_COUNT_KEY)
  await chrome.storage.local.set({
    [FILL_COUNT_KEY]: Number(stored[FILL_COUNT_KEY] ?? 0) + 1
  })
  await updateUninstallUrl()
}
