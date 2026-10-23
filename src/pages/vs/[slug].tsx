import type { GetStaticPaths, GetStaticProps } from "next"

import {
  ComparisonCta,
  ComparisonLayout,
  ComparisonLinks,
  ComparisonSection,
  ComparisonTable,
  FaqList,
  faqJsonLd
} from "~components/landing/comparison"
import { PageHead } from "~components/landing/page-head"
import { COMPARISONS, getComparison, type Comparison } from "~lib/comparisons"
import { absoluteUrl } from "~lib/site"

export const getStaticPaths: GetStaticPaths = () => ({
  paths: COMPARISONS.map((c) => ({ params: { slug: c.slug } })),
  fallback: false
})

export const getStaticProps: GetStaticProps<{ comparison: Comparison }> = ({ params }) => {
  const comparison = getComparison(String(params?.slug))

  return comparison ? { props: { comparison } } : { notFound: true }
}

export default function VsPage({ comparison: c }: { comparison: Comparison }) {
  const path = `/vs/${c.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: c.title,
        description: c.description,
        url: absoluteUrl(path),
        about: [
          {
            "@type": "SoftwareApplication",
            name: "Filler",
            applicationCategory: "BrowserApplication",
            operatingSystem: "Chrome",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
          },
          { "@type": "SoftwareApplication", name: c.name, url: `https://${c.site}` }
        ]
      },
      faqJsonLd(c.faqs)
    ]
  }

  return (
    <>
      <PageHead description={c.description} jsonLd={jsonLd} path={path} title={c.title} />
      <ComparisonLayout tag={`Filler vs ${c.name}`} title={c.title}>
        <div className="landing-doc-section">
          {c.summary.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ComparisonTable rows={c.rows} them={c.name} />
        </div>
        <ComparisonSection title={`Pick ${c.name} if`}>
          <ul className="landing-guide-list">
            {c.better.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </ComparisonSection>
        <ComparisonSection title="Pick Filler if">
          <ul className="landing-guide-list">
            {c.ours.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </ComparisonSection>
        <ComparisonCta />
        <FaqList faqs={c.faqs} />
        <ComparisonLinks current={c.slug} />
      </ComparisonLayout>
    </>
  )
}
