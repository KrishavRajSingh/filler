import type { CSSProperties } from "react"

const CHROME_STORE_URL =
  process.env.NEXT_PUBLIC_CHROME_STORE_URL?.trim() ?? ""

export function InstallCta({ style }: { style: CSSProperties }) {
  const isLive = CHROME_STORE_URL.length > 0

  return (
    <a
      href={isLive ? CHROME_STORE_URL : "#waitlist"}
      id={isLive ? undefined : "install"}
      rel={isLive ? "noopener noreferrer" : undefined}
      style={style}
      target={isLive ? "_blank" : undefined}>
      {isLive ? "Add to Chrome" : "Get early access"}
    </a>
  )
}
