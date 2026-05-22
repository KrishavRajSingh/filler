import { Analytics } from "@vercel/analytics/react"
import type { AppProps } from "next/app"

import "~components/landing/landing.css"
import "~style.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
