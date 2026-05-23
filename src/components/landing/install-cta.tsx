import type { CSSProperties } from "react"

import { trackEvent } from "~lib/analytics"
import { CHROME_STORE_URL } from "~lib/site"

export type InstallCtaLocation = "nav" | "hero" | "footer"

export function InstallCta({
  className,
  location,
  style
}: {
  className?: string
  location: InstallCtaLocation
  style?: CSSProperties
}) {
  return (
    <a
      className={className}
      href={CHROME_STORE_URL}
      onClick={() => trackEvent("add_to_chrome", { location })}
      rel="noopener noreferrer"
      style={style}
      target="_blank">
      Add to Chrome
    </a>
  )
}
