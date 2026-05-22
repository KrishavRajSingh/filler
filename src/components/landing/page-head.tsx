import Head from "next/head"

import { absoluteUrl, SITE_NAME } from "~lib/site"

export function PageHead({
  description,
  jsonLd,
  path = "/",
  title
}: {
  description: string
  jsonLd?: Record<string, unknown>
  path?: string
  title: string
}) {
  const url = absoluteUrl(path)
  const ogImage = absoluteUrl("/og-image.png")
  const pageTitle = path === "/" ? title : `${title} — ${SITE_NAME}`

  return (
    <Head>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <title>{pageTitle}</title>
      <meta content={description} name="description" />
      <link href={url} rel="canonical" />
      <meta content="website" property="og:type" />
      <meta content={SITE_NAME} property="og:site_name" />
      <meta content={pageTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={url} property="og:url" />
      <meta content={ogImage} property="og:image" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={pageTitle} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={ogImage} name="twitter:image" />
      {jsonLd ? (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      ) : null}
    </Head>
  )
}
