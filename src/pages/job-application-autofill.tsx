import type { ReactNode } from "react"

import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { ATS_GUIDES } from "~lib/ats-guides"
import { absoluteUrl, DEFAULT_SITE_URL } from "~lib/site"

const PATH = "/job-application-autofill"

const TITLE = "Job application autofill extension for Chrome: free, no account"

const DESCRIPTION =
  "Filler is a free Chrome extension that autofills job applications on Greenhouse, Lever, Ashby and other sites from a profile you save once. No account, flags guesses, never submits for you."

const FAQS = [
  {
    question: "Is Filler free?",
    answer: "Yes. Filler is free, with no account and no daily fill limit."
  },
  {
    question: "Does it submit applications for me?",
    answer:
      "No. Filler fills fields and stops. You read the form, fix anything, attach your resume and press Submit yourself."
  },
  {
    question: "Where is my profile stored?",
    answer:
      "In your browser, in the extension's storage. When you click Fill, your profile and the form's questions are sent to Filler's server so it can work out which answer goes where."
  },
  {
    question: "Which job sites does it work on?",
    answer:
      "Filler reads the questions on the page instead of relying on one site's layout, so it works on most application forms. We've tested it on live Greenhouse, Lever and Ashby forms. Workday isn't tested yet."
  },
  {
    question: "Does it make up answers?",
    answer:
      "No. It fills from your profile and answers you've saved. When it has to guess, it flags the field for you to check. It never guesses gender, race, veteran or disability questions, and it never ticks consent boxes."
  },
  {
    question: "Does it upload my resume?",
    answer: "No. Filler never touches file uploads. Attach your resume yourself."
  }
] as const

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Filler",
      url: DEFAULT_SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: DEFAULT_SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Job application autofill",
          item: absoluteUrl(PATH)
        }
      ]
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    }
  ]
}

export default function JobApplicationAutofillPage() {
  return (
    <>
      <PageHead description={DESCRIPTION} jsonLd={JSON_LD} path={PATH} title={TITLE} />
      <main className="landing landing-doc">
        <article className="landing-inner landing-guide">
          <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] Job application autofill</p>
            <h1 className="landing-doc-title">
              Autofill job applications from one profile
            </h1>
          </header>

          <div className="landing-doc-section">
            <p>
              Every application asks the same things: name, email, phone,
              location, current job, LinkedIn, and the same few questions about
              you. Filler is a free Chrome extension that fills them from a
              profile you save once.
            </p>
            <p>
              It reads what each question actually asks, not just the field's
              name, so &quot;Where are you based?&quot; gets your city and
              &quot;Current employer&quot; gets your company. You check every
              answer and press Submit yourself.
            </p>
          </div>

          <aside className="landing-doc-section landing-guide-cta">
            <h2>Stop retyping your details</h2>
            <p>Free, no account. Your profile is stored in your browser.</p>
            <InstallCta className="landing-btn" location="ats-guide" showMeta />
          </aside>

          <Section title="Tested on these job sites">
            <ul className="landing-guide-list">
              {ATS_GUIDES.map((guide) => (
                <li key={guide.slug}>
                  <a href={`/autofill/${guide.slug}`}>
                    <strong>{guide.name}</strong>
                  </a>
                  : {guide.summary}.
                </li>
              ))}
            </ul>
            <p>
              It also fills Google Forms, signup pages and most other web forms.
            </p>
          </Section>

          <Section title="What makes it different">
            <ul className="landing-guide-list">
              <li>
                <strong>No account.</strong> Install it and save your profile.
                Nothing to sign up for.
              </li>
              <li>
                <strong>Reuses your answers.</strong> Save a good &quot;about
                me&quot; once and Filler drops it in when a similar question
                shows up on another application.
              </li>
              <li>
                <strong>Flags guesses.</strong> If an answer isn&apos;t in your
                profile and Filler has to infer it, the field is marked for you
                to check.
              </li>
              <li>
                <strong>Never submits.</strong> It fills and stops. You stay in
                control of what gets sent.
              </li>
            </ul>
          </Section>

          <Section title="What it won't do">
            <ul className="landing-guide-list">
              <li>Upload your resume or any other file.</li>
              <li>Answer voluntary gender, race, veteran or disability questions for you.</li>
              <li>Tick consent or marketing checkboxes.</li>
              <li>Invent experience, links or numbers that aren&apos;t in your profile.</li>
            </ul>
          </Section>

          <Section title="FAQ">
            {FAQS.map((faq) => (
              <details key={faq.question}>
                <summary>
                  <strong>{faq.question}</strong>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
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
