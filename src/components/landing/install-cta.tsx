import type { CSSProperties } from "react"

const DEFAULT_CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/filler/dlopehidojlicdenpoadbnkgjiaoimkm"

const CHROME_STORE_URL =
  DEFAULT_CHROME_STORE_URL

export function InstallCta({ style }: { style: CSSProperties }) {
  return (
    <a
      href={CHROME_STORE_URL}
      rel="noopener noreferrer"
      style={style}
      target="_blank">
      Add to Chrome
    </a>
  )
}
