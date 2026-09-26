import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { FORM_GUIDES } from "~lib/form-guides"
import { absoluteUrl } from "~lib/site"

const FORMS_DESCRIPTION =
  "Field-by-field guides to common online forms: what each question asks, what's required, and the mistakes that slow applications down."

const FORMS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Form guides",
  url: absoluteUrl("/forms"),
  description: FORMS_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "Filler",
    url: "https://filler.live",
    logo: {
      "@type": "ImageObject",
      url: "https://filler.live/og-image.png"
    }
  },
  hasPart: FORM_GUIDES.map((guide) => ({
    "@type": "Article",
    headline: guide.title,
    url: absoluteUrl(`/forms/${guide.slug}`)
  }))
} as const

export default function FormsIndexPage() {
  return (
    <>
      <PageHead
        description={FORMS_DESCRIPTION}
        jsonLd={FORMS_JSON_LD}
        path="/forms"
        title="Form guides"
      />
      <main className="landing landing-doc">
        <article className="landing-inner">
          <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] Form guides</p>
            <h1 className="landing-doc-title">How to fill out common forms, field by field</h1>
            <p className="landing-doc-updated">
              {FORM_GUIDES.length} {FORM_GUIDES.length === 1 ? "guide" : "guides"}
            </p>
          </header>

          {FORM_GUIDES.map((guide) => (
            <section className="landing-doc-section" key={guide.slug}>
              <h2>
                <a className="landing-blog-headline" href={`/forms/${guide.slug}`}>
                  {guide.title}
                </a>
              </h2>
              <p>{guide.description}</p>
            </section>
          ))}

          <section className="landing-doc-section">
            <p>
              Looking for tips on filling forms in general? Read the{" "}
              <a href="/blog">Filler blog</a>.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
