import type { ReactNode } from "react"

import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { COMPARISONS, type ComparisonRow } from "~lib/comparisons"

export function ComparisonLayout({
  children,
  tag,
  title
}: {
  children: ReactNode
  tag: string
  title: string
}) {
  return (
    <main className="landing landing-doc">
      <article className="landing-inner landing-guide">
        <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
          <LandingBrand />
        </nav>
        <header className="landing-doc-header">
          <p className="landing-section-tag">[●] {tag}</p>
          <h1 className="landing-doc-title">{title}</h1>
          <p className="landing-doc-updated">
            Other tools&apos; details checked October 2026. Plans change; check their sites
            before you decide.
          </p>
        </header>
        {children}
      </article>
    </main>
  )
}

export function ComparisonSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="landing-doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function ComparisonTable({ rows, them }: { rows: ComparisonRow[]; them: string }) {
  return (
    <div className="landing-compare-scroll">
      <table className="landing-compare-table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Filler</th>
            <th scope="col">{them}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <th scope="row">{row.feature}</th>
              <td>{row.filler}</td>
              <td>{row.them}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ComparisonCta() {
  return (
    <aside className="landing-doc-section landing-guide-cta">
      <h2>Try Filler on your next form</h2>
      <p>
        Free, no account. Save your details once, open a form, click Fill. You check every
        field and submit it yourself. Want help with &quot;Why this role?&quot; answers too?{" "}
        <a href="/pass?from=vs">See the Job Hunt Pass</a> ($5 for 30 days, never renews).
      </p>
      <InstallCta className="landing-btn" location="vs" showMeta />
    </aside>
  )
}

export function ComparisonLinks({ current }: { current?: string }) {
  return (
    <ComparisonSection title="More comparisons">
      <ul className="landing-guide-list">
        {COMPARISONS.filter((c) => c.slug !== current).map((c) => (
          <li key={c.slug}>
            <a href={`/vs/${c.slug}`}>Filler vs {c.name}</a>
          </li>
        ))}
        <li>
          <a href="/alternatives/simplify-copilot">Simplify Copilot alternatives</a>
        </li>
        <li>
          <a href="/best/job-application-autofill">Best job application autofill tools</a>
        </li>
      </ul>
    </ComparisonSection>
  )
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  }
}

export function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <ComparisonSection title="FAQ">
      {faqs.map((faq) => (
        <details key={faq.question}>
          <summary>
            <strong>{faq.question}</strong>
          </summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </ComparisonSection>
  )
}
