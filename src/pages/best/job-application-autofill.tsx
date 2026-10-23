import {
  ComparisonCta,
  ComparisonLayout,
  ComparisonLinks,
  ComparisonSection,
  FaqList,
  faqJsonLd
} from "~components/landing/comparison"
import { PageHead } from "~components/landing/page-head"
import { COMPARISONS } from "~lib/comparisons"
import { absoluteUrl } from "~lib/site"

const PATH = "/best/job-application-autofill"
const TITLE = "Best job application autofill tools in 2026 (free and paid)"
const DESCRIPTION =
  "Filler, Simplify Copilot, Jobright, Magical and LazyApply compared: price, account, daily limits, and who presses Submit."

// Rows per tool, in the order the table shows them. Filler first: it's our page, and we say so.
const TOOLS = [
  {
    name: "Filler",
    href: "/",
    price: "Free; Job Hunt Pass $5 for 30 days (coming soon)",
    account: "No",
    scope: "Any web form",
    submit: "You"
  },
  {
    name: "Simplify Copilot",
    href: "/vs/simplify",
    price: "Free; Simplify+ reported $39.99/month",
    account: "Yes",
    scope: "Job applications",
    submit: "You"
  },
  {
    name: "Jobright",
    href: "/vs/jobright",
    price: "Free plan with a reported daily autofill cap; Turbo reported $39.99/month",
    account: "Yes",
    scope: "Job applications",
    submit: "You"
  },
  {
    name: "Magical",
    href: "/vs/magical",
    price: "See getmagical.com",
    account: "Yes",
    scope: "Text expansion and app-to-app autofill",
    submit: "You"
  },
  {
    name: "LazyApply",
    href: "/vs/lazyapply",
    price: "Paid, reported from about $99",
    account: "Yes",
    scope: "Job boards, in bulk",
    submit: "The bot"
  }
]

const FAQS = [
  {
    question: "Which job application autofill is free?",
    answer:
      "Filler and Simplify Copilot both autofill for free. Jobright's free plan reportedly caps autofills per day. LazyApply is paid."
  },
  {
    question: "Should I use an auto-apply bot?",
    answer:
      "Bots send more applications, but with generic answers, and heavy automation can break some job sites' terms. Autofill that you check before submitting is slower and safer."
  },
  {
    question: "Is this list neutral?",
    answer:
      "No: Filler is our product. We've tried to be fair, linked each tool's own site, and said where each one is the better pick on its comparison page."
  }
]

export default function BestJobApplicationAutofill() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: TITLE,
        url: absoluteUrl(PATH),
        itemListElement: TOOLS.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.name
        }))
      },
      faqJsonLd(FAQS)
    ]
  }

  return (
    <>
      <PageHead description={DESCRIPTION} jsonLd={jsonLd} path={PATH} title={TITLE} />
      <ComparisonLayout tag="Job application autofill" title={TITLE}>
        <div className="landing-doc-section">
          <p>
            Five tools people use to stop retyping the same details into every application.
            Filler is ours; each comparison page says where the other tool wins.
          </p>
          <div className="landing-compare-scroll">
            <table className="landing-compare-table">
              <thead>
                <tr>
                  <th scope="col">Tool</th>
                  <th scope="col">Price</th>
                  <th scope="col">Account</th>
                  <th scope="col">Fills</th>
                  <th scope="col">Submits</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool) => (
                  <tr key={tool.name}>
                    <th scope="row">
                      <a href={tool.href}>{tool.name}</a>
                    </th>
                    <td>{tool.price}</td>
                    <td>{tool.account}</td>
                    <td>{tool.scope}</td>
                    <td>{tool.submit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ComparisonCta />
        <ComparisonSection title="How to choose">
          <ul className="landing-guide-list">
            <li>Only want forms filled, free, no account: Filler.</li>
            <li>Want a job board and tracker with autofill: Simplify.</li>
            <li>Want AI to pick jobs and tailor resumes: Jobright.</li>
            <li>Type the same text all day across apps: Magical.</li>
            <li>Want volume and accept a bot submitting for you: LazyApply.</li>
          </ul>
        </ComparisonSection>
        <FaqList faqs={FAQS} />
        <ComparisonLinks />
      </ComparisonLayout>
    </>
  )
}
