import type { CSSProperties, ReactNode } from "react"

export default function PrivacyPage() {
  return (
    <main className="landing" style={pageStyle}>
      <article className="landing-inner" style={articleStyle}>
        <nav aria-label="Main navigation" className="landing-nav">
          <a className="landing-brand" href="/">
            Filler
          </a>
        </nav>

        <header style={headerStyle}>
          <p className="landing-section-tag">[●] Privacy Policy</p>
          <h1 style={titleStyle}>Privacy Policy for Filler</h1>
          <p style={updatedStyle}>Last updated: May 19, 2026</p>
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
          <a href="mailto:krishavrajsingh@gmail.com" style={inlineLinkStyle}>
            krishavrajsingh@gmail.com
          </a>
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
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <p style={sectionTextStyle}>{children}</p>
    </section>
  )
}

const pageStyle = {
  minHeight: "100vh"
} satisfies CSSProperties

const articleStyle = {
  paddingBottom: 48
} satisfies CSSProperties

const headerStyle = {
  borderBottom: "1px solid #ddd9d0",
  marginBottom: 8,
  padding: "48px 0 32px"
} satisfies CSSProperties

const titleStyle = {
  fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif',
  fontSize: "clamp(2rem, 5vw, 3rem)",
  fontWeight: 600,
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  margin: "0 0 12px"
} satisfies CSSProperties

const updatedStyle = {
  color: "#8a8a8a",
  margin: 0
} satisfies CSSProperties

const sectionStyle = {
  borderTop: "1px solid #ddd9d0",
  padding: "24px 0"
} satisfies CSSProperties

const sectionTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  margin: "0 0 8px"
} satisfies CSSProperties

const sectionTextStyle = {
  color: "#5c5c5c",
  fontSize: 15,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: "62ch"
} satisfies CSSProperties

const inlineLinkStyle = {
  color: "#141414",
  fontWeight: 500
} satisfies CSSProperties
