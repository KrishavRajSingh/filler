export const SITE_NAME = "Filler"

export const DEFAULT_SITE_URL = "https://filler.live"

export const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/filler/dlopehidojlicdenpoadbnkgjiaoimkm"

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL
  return url.replace(/\/$/, "")
}

export function absoluteUrl(path = ""): string {
  const base = getSiteUrl()

  if (!path || path === "/") {
    return base
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
