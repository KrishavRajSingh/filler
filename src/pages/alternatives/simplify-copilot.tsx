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
import { COMPARISONS, getComparison } from "~lib/comparisons"
import { absoluteUrl } from "~lib/site"

const PATH = "/alternatives/simplify-copilot"
const TITLE = "Simplify Copilot alternatives: autofill job applications without an account"
const DESCRIPTION =
  "Looking for a Simplify Copilot alternative? Filler autofills job applications and any other web form for free, with no account and no $39.99/month upgrade."

const FAQS = [
  {
    question: "What is the best free alternative to Simplify Copilot?",
    answer:
      "If you only need the forms filled, Filler: free, no account, and it works on any web form, not only job sites. If you want a job board and tracker too, Simplify itself is hard to beat."
  },
  {
    question: "Why look for a Simplify alternative?",
    answer:
      "The usual reasons are not wanting an account holding your work history, wanting autofill on forms Simplify doesn't target, or not wanting Simplify+ at a reported $39.99 a month for AI answers."
  },
  {
    question: "Does Filler work on Greenhouse, Lever and Ashby?",
    answer:
      "Yes. Each was tested on a live application form; see the guides under filler.live/autofill."
  }
]

export default function SimplifyAlternatives() {
  const simplify = getComparison("simplify")!
  const others = COMPARISONS.filter((c) => c.slug !== "simplify")
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: TITLE, description: DESCRIPTION, url: absoluteUrl(PATH) },
      faqJsonLd(FAQS)
    ]
  }

  return (
    <>
      <PageHead description={DESCRIPTION} jsonLd={jsonLd} path={PATH} title={TITLE} />
      <ComparisonLayout tag="Simplify alternatives" title={TITLE}>
        <div className="landing-doc-section">
          <p>
            Simplify Copilot is free and good at what it does. People look elsewhere when they
            don&apos;t want an account, need autofill on non-job forms, or don&apos;t want to pay
            monthly for AI-written answers.
          </p>
          <ComparisonTable rows={simplify.rows} them={simplify.name} />
        </div>
        <ComparisonCta />
        <ComparisonSection title="Other options">
          <ul className="landing-guide-list">
            {others.map((c) => (
              <li key={c.slug}>
                <strong>{c.name}</strong>: {c.oneLine}.{" "}
                <a href={`/vs/${c.slug}`}>Compare with Filler</a>
              </li>
            ))}
          </ul>
        </ComparisonSection>
        <FaqList faqs={FAQS} />
        <ComparisonLinks />
      </ComparisonLayout>
    </>
  )
}
