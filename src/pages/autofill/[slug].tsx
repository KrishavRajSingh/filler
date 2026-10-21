import type { GetStaticPaths, GetStaticProps } from "next"
import type { ReactNode } from "react"

import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { ATS_GUIDES, getAtsGuide, type AtsGuide } from "~lib/ats-guides"
import { absoluteUrl, DEFAULT_SITE_URL } from "~lib/site"

const HUB_PATH = "/job-application-autofill"

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  })
}

function buildJsonLd(guide: AtsGuide) {
  const path = `/autofill/${guide.slug}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: guide.title,
        description: guide.description,
        url: absoluteUrl(path),
        dateModified: guide.dateModified,
        about: {
          "@type": "SoftwareApplication",
          name: "Filler",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: DEFAULT_SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Job application autofill",
            item: absoluteUrl(HUB_PATH)
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${guide.name} autofill`,
            item: absoluteUrl(path)
          }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      }
    ]
  }
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: ATS_GUIDES.map((guide) => ({ params: { slug: guide.slug } })),
  fallback: false
})

export const getStaticProps: GetStaticProps<{ guide: AtsGuide }> = ({ params }) => {
  const guide = getAtsGuide(String(params?.slug))

  return guide ? { props: { guide } } : { notFound: true }
}

export default function AtsAutofillPage({ guide }: { guide: AtsGuide }) {
  const others = ATS_GUIDES.filter((other) => other.slug !== guide.slug)

  return (
    <>
      <PageHead
        description={guide.description}
        jsonLd={buildJsonLd(guide)}
        path={`/autofill/${guide.slug}`}
        title={guide.title}
      />
      <main className="landing landing-doc">
        <article className="landing-inner landing-guide">
          <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] {guide.name} autofill</p>
            <h1 className="landing-doc-title">{guide.title}</h1>
            <p className="landing-doc-updated">
              Tested on a live {guide.name} form: {formatDate(guide.dateModified)}
            </p>
          </header>

          <div className="landing-doc-section">
            {guide.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              <strong>How to spot a {guide.name} form:</strong> the address looks like{" "}
              <code>{guide.urlPattern}</code>.
            </p>
          </div>

          <aside className="landing-doc-section landing-guide-cta">
            <h2>Fill your next {guide.name} application in one click</h2>
            <p>
              Free, no account. Save your details once, open the application,
              click Fill. You review every field and submit it yourself.
            </p>
            <InstallCta className="landing-btn" location="ats-guide" showMeta />
          </aside>

          <Section title={`What Filler fills on ${guide.name}`}>
            <ul className="landing-guide-list">
              {guide.fills.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="What it leaves for you">
            <ul className="landing-guide-list">
              {guide.leaves.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="How to use it">
            <ol className="landing-guide-list">
              <li>Add Filler to Chrome and open its profile from the toolbar icon.</li>
              <li>
                Save your details once: name, email, phone, location, current role
                and company, links, and any answers you reuse.
              </li>
              <li>Open the {guide.name} application and click Fill in the Filler popup.</li>
              <li>
                Read every field. Filler flags answers it had to guess. Attach your
                resume, answer what's left, and submit.
              </li>
            </ol>
          </Section>

          <Section title={`Tips for ${guide.name} applications`}>
            <ul className="landing-guide-list">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Section>

          <Section title="FAQ">
            {guide.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  <strong>{faq.question}</strong>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </Section>

          <Section title="Other job sites">
            <ul className="landing-guide-list">
              {others.map((other) => (
                <li key={other.slug}>
                  <a href={`/autofill/${other.slug}`}>{other.name} autofill</a>
                </li>
              ))}
              <li>
                <a href={HUB_PATH}>All job application autofill</a>
              </li>
            </ul>
            <p>
              Filler is not affiliated with {guide.name}. {guide.name} is a trademark
              of its owner.
            </p>
          </Section>
        </article>
      </main>
    </>
  )
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="landing-doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
