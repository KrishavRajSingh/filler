import { Analytics } from "@vercel/analytics/react"
import Head from "next/head"
import type { AppProps } from "next/app"
import Script from "next/script"

import { UmamiScript } from "~components/analytics/umami-script"
import "~components/landing/landing.css"
import "~style.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      <UmamiScript />
      <Script
        async
        data-key="d1ODSeDN4GcwXLGkgMfOOg"
        src="https://analytics.ahrefs.com/analytics.js"
        strategy="afterInteractive"
      />
    </>
  )
}
