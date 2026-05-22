import type { ReactNode } from "react"

import { LandingBrand } from "~components/landing/landing-brand"

export default function PrivacyPage() {
  return (
    <main className="landing landing-doc">
      <article className="landing-inner">
        <nav
          aria-label="Main navigation"
          className="landing-nav landing-nav-compact">
          <LandingBrand />
        </nav>

        <header className="landing-doc-header">
          <p className="landing-section-tag">[●] Privacy Policy</p>
          <h1 className="landing-doc-title">Privacy Policy for Filler</h1>
          <p className="landing-doc-updated">Last updated: May 19, 2026</p>
        </header>

        <Section title="Overview">
          Filler helps users fill repetitive web forms from a profile they create.
          The extension reads visible form fields only after the user clicks the
          extension, generates suggested answers from the user&apos;s profile, and
          fills supported fields. Filler does not submit forms.
        </Section>

        <Section title="Information Filler Uses">
          Filler may use the profile information you save in the extension, the
          visible form fields on the page you choose to fill, and page context such
          as the page title and URL. This information is used only to generate form
          fill suggestions for the form you asked Filler to fill.
        </Section>

        <Section title="Local Profile Storage">
          Your profile is stored locally in your browser using extension storage.
          You can edit or clear your profile from the extension options page.
        </Section>

        <Section title="Server Processing">
          When you click “Fill this form,” Filler sends your saved profile, visible
          form fields, and page context to Filler&apos;s server API to generate fill
          suggestions. The server may use an AI provider to produce those
          suggestions. Filler does not use this data for advertising, selling, or
          creditworthiness decisions.
        </Section>

        <Section title="What Filler Does Not Do">
          Filler does not sell your data, does not submit forms for you, does not
          intentionally collect passwords, payment details, OTPs, or government ID
          fields, and does not run continuously in the background to monitor your
          browsing.
        </Section>

        <Section title="User Control">
          You decide when Filler reads a form by clicking the extension. Always
          review generated answers before submitting any form.
        </Section>

        <Section title="Contact">
          For privacy questions or support, contact the developer at{" "}
          <a href="mailto:krishavrajsingh@gmail.com">krishavrajsingh@gmail.com</a>
          .
        </Section>
      </article>
    </main>
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
      <p>{children}</p>
    </section>
  )
}
