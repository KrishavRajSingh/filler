import type { GetStaticPaths, GetStaticProps } from "next"
import type { ReactNode } from "react"

import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { FORM_GUIDES, getFormGuide, type FormGuide } from "~lib/form-guides"
import { absoluteUrl, DEFAULT_SITE_URL } from "~lib/site"

const ORGANIZATION = {
  "@type": "Organization",
  name: "Filler",
  url: DEFAULT_SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${DEFAULT_SITE_URL}/og-image.png`
  }
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  })
}

function buildJsonLd(guide: FormGuide) {
  const path = `/forms/${guide.slug}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        author: {
          "@type": "Person",
          name: "Krishav Raj Singh",
          jobTitle: "Developer"
        },
        publisher: ORGANIZATION,
        datePublished: guide.datePublished,
        dateModified: guide.dateModified,
        mainEntityOfPage: absoluteUrl(path)
      },
      {
        "@type": "HowTo",
        name: guide.title,
        step: guide.steps.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: DEFAULT_SITE_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Form guides",
            item: `${DEFAULT_SITE_URL}/forms`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.name,
            item: `${DEFAULT_SITE_URL}${path}`
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
  paths: FORM_GUIDES.map((guide) => ({ params: { slug: guide.slug } })),
  fallback: false
})

export const getStaticProps: GetStaticProps<{ guide: FormGuide }> = ({
  params
}) => {
  const guide = getFormGuide(String(params?.slug))

  return guide ? { props: { guide } } : { notFound: true }
}

export default function FormGuidePage({ guide }: { guide: FormGuide }) {
  return (
    <>
      <PageHead
        description={guide.description}
        jsonLd={buildJsonLd(guide)}
        path={`/forms/${guide.slug}`}
        title={guide.title}
      />
      <main className="landing landing-doc">
        <article className="landing-inner landing-guide">
          <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] Form guide</p>
            <h1 className="landing-doc-title">{guide.title}</h1>
            <p className="landing-doc-updated">
              Last updated: {formatDate(guide.dateModified)}
            </p>
          </header>

          <div className="landing-doc-section">
            {guide.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="landing-doc-section landing-guide-cta">
            <h2>Fill the {guide.name} in one click</h2>
            <p>
              Save your details once. Filler reads each question on the online
              form and fills it from your profile. You review every field
              before moving on, and it never submits for you.
            </p>
            <InstallCta
              className="landing-btn"
              location="form-guide"
              showMeta
            />
          </aside>

          <Section title="Where to apply">
            <p>
              <strong>Online (fastest):</strong>{" "}
              <a href={guide.onlineForm.url} rel="noopener noreferrer" target="_blank">
                {guide.onlineForm.label}
              </a>
            </p>
            {guide.paperForm ? (
              <p>
                <strong>Paper:</strong>{" "}
                <a href={guide.paperForm.url} rel="noopener noreferrer" target="_blank">
                  {guide.paperForm.label}
                </a>
                . {guide.paperForm.note}
              </p>
            ) : null}
          </Section>

          <Section title="What you need before you start">
            <ul className="landing-guide-list">
              {guide.beforeYouStart.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          {guide.sections.map((section) => (
            <Section key={section.title} title={section.title}>
              <dl className="landing-guide-fields">
                {section.fields.map((field) => (
                  <div className="landing-guide-field" key={field.label}>
                    <dt>
                      {field.label}
                      <span className="landing-guide-badge">
                        {field.required ? "Required" : "Optional"}
                      </span>
                    </dt>
                    <dd>{field.tip}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ))}

          <Section title="Step by step">
            <ol className="landing-guide-list">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Section>

          <Section title="Common mistakes">
            <ul className="landing-guide-list">
              {guide.mistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
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

          <Section title="Sources">
            <ul className="landing-guide-list">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noopener noreferrer" target="_blank">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Filler is not affiliated with the organization that issues this
              form. Always check the official form for current requirements.
            </p>
            <p>
              <a href="/forms">More form guides</a>
            </p>
          </Section>
        </article>
      </main>
    </>
  )
}

function Section({
  children,
  title
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="landing-doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
