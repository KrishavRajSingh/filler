import type { CSSProperties, ReactNode } from "react"

export default function PrivacyPage() {
  return (
    <main style={pageStyle}>
      <article style={cardStyle}>
        <a href="/" style={backLinkStyle}>
          Filler
        </a>

        <p style={eyebrowStyle}>Privacy Policy</p>
        <h1 style={titleStyle}>Privacy Policy for Filler</h1>
        <p style={updatedStyle}>Last updated: May 19, 2026</p>

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

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <p style={sectionTextStyle}>{children}</p>
    </section>
  )
}

const pageStyle = {
  background:
    "radial-gradient(circle at 15% 12%, rgba(211, 150, 86, 0.18), transparent 28%), #f6eddf",
  color: "#251c15",
  fontFamily:
    'Avenir Next, "Gill Sans", "Trebuchet MS", ui-sans-serif, sans-serif',
  minHeight: "100vh",
  padding: "24px"
} satisfies CSSProperties

const cardStyle = {
  background: "#fffaf2",
  border: "1px solid #ead9c2",
  borderRadius: 28,
  boxShadow: "0 30px 90px rgba(86, 55, 28, 0.14)",
  margin: "0 auto",
  maxWidth: 820,
  padding: "32px"
} satisfies CSSProperties

const backLinkStyle = {
  color: "#2c2118",
  display: "inline-flex",
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 36,
  textDecoration: "none"
} satisfies CSSProperties

const eyebrowStyle = {
  color: "#9b7654",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.14em",
  margin: "0 0 10px",
  textTransform: "uppercase"
} satisfies CSSProperties

const titleStyle = {
  fontSize: "clamp(36px, 7vw, 64px)",
  letterSpacing: "-0.06em",
  lineHeight: 0.95,
  margin: "0 0 12px"
} satisfies CSSProperties

const updatedStyle = {
  color: "#7b6755",
  lineHeight: 1.5,
  margin: "0 0 30px"
} satisfies CSSProperties

const sectionStyle = {
  borderTop: "1px solid #ead9c2",
  padding: "22px 0"
} satisfies CSSProperties

const sectionTitleStyle = {
  fontSize: 22,
  letterSpacing: "-0.03em",
  margin: "0 0 8px"
} satisfies CSSProperties

const sectionTextStyle = {
  color: "#5b4b3e",
  fontSize: 16,
  lineHeight: 1.7,
  margin: 0
} satisfies CSSProperties

const inlineLinkStyle = {
  color: "#2c2118",
  fontWeight: 900
} satisfies CSSProperties
