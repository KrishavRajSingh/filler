import Script from "next/script"

import { getUmamiConfig } from "~lib/analytics"

export function UmamiScript() {
  const config = getUmamiConfig()

  if (!config) {
    return null
  }

  return (
    <Script
      data-website-id={config.websiteId}
      defer
      src={config.scriptUrl}
      strategy="afterInteractive"
    />
  )
}
