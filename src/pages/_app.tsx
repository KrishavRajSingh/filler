import { Analytics } from "@vercel/analytics/react"
import Head from "next/head"
import type { AppProps } from "next/app"
import { Archivo } from "next/font/google"

import { UmamiScript } from "~components/analytics/umami-script"
import "~components/landing/landing.css"
import "~components/landing/sheet.css"
import "~style.css"

const archivo = Archivo({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"]
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
      </Head>
      <style global jsx>{`
        :root {
          --sheet-font: ${archivo.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      <Analytics />
      <UmamiScript />
    </>
  )
}
