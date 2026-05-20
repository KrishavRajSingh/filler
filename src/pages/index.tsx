import type { CSSProperties, ReactNode } from "react"

import { InstallCta } from "~components/landing/install-cta"
import { WaitlistForm } from "~components/landing/waitlist-form"

const DEMO_VIDEO_URL = "https://files.catbox.moe/6ggdog.mp4"

export default function IndexPage() {
  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <nav style={navStyle} aria-label="Main navigation">
          <a style={brandStyle} href="/">
            Filler
          </a>
          <div style={navLinksStyle}>
            <a style={navLinkStyle} href="#how-it-works">
              How it works
            </a>
            <a style={navLinkStyle} href="#handles">
              What it handles
            </a>
            <a style={navLinkStyle} href="#privacy">
              Privacy
            </a>
          </div>
          <InstallCta style={navButtonStyle} />
        </nav>

        <div style={heroGridStyle}>
          <div style={heroCopyStyle}>
            <p style={eyebrowStyle}>AI form filler for Chrome</p>
            <h1 style={headlineStyle}>Forms filled in one click.</h1>
            <p style={subheadlineStyle}>
              Filler reads each question, understands what it means, and answers
              from your saved profile.
            </p>

            <div style={ctaRowStyle}>
              <InstallCta style={primaryCtaStyle} />
              <a style={secondaryCtaStyle} href="#how-it-works">
                See how it works
              </a>
            </div>

            <WaitlistForm />

            <div style={chipRowStyle} aria-label="Supported form controls">
              {["Dropdowns", "Radio buttons", "Long answers"].map((label) => (
                <span key={label} style={chipStyle}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <FormDemoCard />
        </div>

        <section id="how-it-works" style={howItWorksSectionStyle}>
          <div style={stepsStyle}>
            <StepCard number="1" title="Save your profile">
              Add your education, work, links, and reusable answers once.
            </StepCard>
            <StepCard number="2" title="Open any form">
              Filler reads the question, nearby text, and available options.
            </StepCard>
            <StepCard number="3" title="Click fill">
              It writes answers from your profile and drafts what needs review.
            </StepCard>
          </div>

          <div style={demoShowcaseGridStyle}>
            <DemoVideo />
            <DifferentiatorCopy />
          </div>
        </section>

        <section id="handles" style={proofSectionStyle}>
          <div>
            <p style={sectionLabelStyle}>Built for messy real forms</p>
            <h2 style={sectionTitleStyle}>Not just browser autofill.</h2>
          </div>
          <div style={proofGridStyle}>
            {[
              "Google Forms",
              "Ashby",
              "Tally",
              "Dropdowns",
              "Radio buttons",
              "Profile-based answers"
            ].map((label) => (
              <span key={label} style={proofPillStyle}>
                {label}
              </span>
            ))}
          </div>
        </section>

        <section id="privacy" style={trustNoteStyle}>
          <span style={trustIconStyle}>✓</span>
          <p style={trustTextStyle}>
            You control the profile. Filler uses it only to answer the form you
            ask it to fill.{" "}
            <a href="/privacy" style={inlineLinkStyle}>
              Read the privacy policy.
            </a>
          </p>
        </section>
      </section>
    </main>
  )
}

function FormDemoCard() {
  return (
    <div
      style={demoWrapStyle}
      aria-label="Examples of Filler matching different form questions to profile answers">
      <div style={paperShadowStyle} />
      <div style={demoCardStyle}>
        <div style={browserBarStyle}>
          <span style={{ ...dotStyle, background: "#e56b4b" }} />
          <span style={{ ...dotStyle, background: "#eeb64b" }} />
          <span style={{ ...dotStyle, background: "#59b86f" }} />
          <strong style={browserTitleStyle}>Application form</strong>
        </div>

        <div style={demoBodyStyle}>
          <div>
            <p style={demoLabelStyle}>What Filler does</p>
            <h2 style={demoTitleStyle}>Questions in. Answers out.</h2>
          </div>

          <div style={demoFlowStyle}>
            <DemoColumn
              items={[
                "When did you finish college?",
                "What is your degree?",
                "Are you open to office work?"
              ]}
              label="Form asks"
            />
            <DemoColumn
              items={[
                "Graduation year: 2025",
                "Degree: Computer Science",
                "Work preference: flexible"
              ]}
              label="Your profile"
              variant="profile"
            />
            <DemoColumn
              items={[
                "2025",
                "B.Tech/B.E. in Computer Science",
                "Open to hybrid or office work"
              ]}
              label="Form filled"
              variant="filled"
            />
          </div>

          <div style={filledStatusStyle}>Filled 12 fields</div>
        </div>
      </div>
    </div>
  )
}

function DemoColumn({
  items,
  label,
  variant = "question"
}: {
  items: string[]
  label: string
  variant?: "filled" | "profile" | "question"
}) {
  const isFilled = variant === "filled"
  const isProfile = variant === "profile"

  return (
    <div
      style={{
        ...demoColumnStyle,
        background: isFilled ? "#eaffd4" : isProfile ? "#fffaf2" : "#f4e6d2",
        border: isFilled
          ? "1px solid #bfdf99"
          : isProfile
            ? "1px dashed #c49b70"
            : "1px solid #e3c6a4"
      }}>
      <span
        style={{
          ...miniLabelStyle,
          color: isFilled ? "#4f7a2b" : "#9a7048"
        }}>
        {label}
      </span>
      <div style={demoListStyle}>
        {items.map((item) => (
          <div key={item} style={demoListItemStyle}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function DifferentiatorCopy() {
  return (
    <div style={differentiatorCopyStyle}>
      <p style={sectionLabelStyle}>Smarter than autofill</p>
      <h2 style={differentiatorTitleStyle}>
        It reads the question, not just the field name.
      </h2>
      <ul style={differentiatorListStyle}>
        <DifferentiatorItem title="Understands context">
          Browser autofill matches <code style={codeStyle}>name=&quot;email&quot;</code>.
          Filler reads &quot;When did you finish college?&quot; and pulls your
          graduation year.
        </DifferentiatorItem>
        <DifferentiatorItem title="AI maps wording">
          The same profile answer works even when every form asks differently.
          AI matches each question to the right field.
        </DifferentiatorItem>
        <DifferentiatorItem title="Handles real controls">
          Dropdowns, radio groups, checkboxes, and custom widgets — not just
          plain text inputs.
        </DifferentiatorItem>
        <DifferentiatorItem title="Drafts open answers">
          For &quot;Why do you want to join us?&quot;, Filler drafts from your
          saved answers so you can review before submitting.
        </DifferentiatorItem>
      </ul>
    </div>
  )
}

function DifferentiatorItem({
  children,
  title
}: {
  children: ReactNode
  title: string
}) {
  return (
    <li style={differentiatorItemStyle}>
      <strong style={differentiatorItemTitleStyle}>{title}</strong>
      <p style={differentiatorItemTextStyle}>{children}</p>
    </li>
  )
}

function DemoVideo() {
  return (
    <div style={demoWrapStyle} aria-label="Filler demo video">
      <div style={paperShadowStyle} />
      <div style={demoCardStyle}>
        <div style={browserBarStyle}>
          <span style={{ ...dotStyle, background: "#e56b4b" }} />
          <span style={{ ...dotStyle, background: "#eeb64b" }} />
          <span style={{ ...dotStyle, background: "#59b86f" }} />
          <strong style={browserTitleStyle}>Filler demo</strong>
        </div>

        <div style={demoVideoFrameStyle}>
          <video
            autoPlay
            controls
            loop
            muted
            playsInline
            preload="metadata"
            src={DEMO_VIDEO_URL}
            style={demoVideoStyle}
          />
        </div>
      </div>
    </div>
  )
}

function StepCard({
  children,
  number,
  title
}: {
  children: ReactNode
  number: string
  title: string
}) {
  return (
    <article style={stepCardStyle}>
      <span style={stepNumberStyle}>{number}</span>
      <h3 style={stepTitleStyle}>{title}</h3>
      <p style={stepTextStyle}>{children}</p>
    </article>
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

const shellStyle = {
  background: "#f8efe3",
  border: "1px solid #ead9c2",
  borderRadius: 32,
  boxShadow: "0 30px 90px rgba(86, 55, 28, 0.14)",
  margin: "0 auto",
  maxWidth: 1180,
  overflow: "hidden",
  padding: "28px"
} satisfies CSSProperties

const navStyle = {
  alignItems: "center",
  display: "flex",
  gap: 18,
  justifyContent: "space-between",
  marginBottom: 54
} satisfies CSSProperties

const brandStyle = {
  color: "#251c15",
  fontSize: 22,
  fontWeight: 950,
  letterSpacing: "-0.05em",
  textDecoration: "none"
} satisfies CSSProperties

const navLinksStyle = {
  color: "#6c5a4a",
  display: "flex",
  flexWrap: "wrap",
  fontSize: 14,
  gap: 20
} satisfies CSSProperties

const navLinkStyle = {
  color: "inherit",
  textDecoration: "none"
} satisfies CSSProperties

const navButtonStyle = {
  background: "#251c15",
  borderRadius: 999,
  color: "#fff8ec",
  fontSize: 14,
  fontWeight: 900,
  padding: "12px 16px",
  textDecoration: "none",
  whiteSpace: "nowrap"
} satisfies CSSProperties

const heroGridStyle = {
  alignItems: "center",
  display: "grid",
  gap: 36,
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
} satisfies CSSProperties

const heroCopyStyle = {
  maxWidth: 620
} satisfies CSSProperties

const eyebrowStyle = {
  background: "#fff8ec",
  border: "1px solid #e2c8a7",
  borderRadius: 999,
  color: "#805834",
  display: "inline-flex",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.12em",
  margin: 0,
  padding: "8px 12px",
  textTransform: "uppercase"
} satisfies CSSProperties

const headlineStyle = {
  fontSize: "clamp(54px, 8vw, 86px)",
  letterSpacing: "-0.08em",
  lineHeight: 0.9,
  margin: "22px 0 18px"
} satisfies CSSProperties

const subheadlineStyle = {
  color: "#5b4b3e",
  fontSize: "clamp(19px, 2.4vw, 24px)",
  lineHeight: 1.38,
  margin: "0 0 26px",
  maxWidth: 590
} satisfies CSSProperties

const ctaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 28
} satisfies CSSProperties

const primaryCtaStyle = {
  background: "#251c15",
  borderRadius: 999,
  color: "#fff8ec",
  fontSize: 16,
  fontWeight: 950,
  padding: "16px 22px",
  textDecoration: "none"
} satisfies CSSProperties

const secondaryCtaStyle = {
  background: "#fff8ec",
  border: "1px solid #d6b995",
  borderRadius: 999,
  color: "#251c15",
  fontSize: 16,
  fontWeight: 900,
  padding: "15px 20px",
  textDecoration: "none"
} satisfies CSSProperties

const chipRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
} satisfies CSSProperties

const chipStyle = {
  background: "#fff8ec",
  border: "1px solid #e4cfb3",
  borderRadius: 999,
  color: "#5b4b3e",
  fontWeight: 900,
  padding: "10px 13px"
} satisfies CSSProperties

const demoWrapStyle = {
  minHeight: 430,
  position: "relative"
} satisfies CSSProperties

const paperShadowStyle = {
  background: "rgba(195, 135, 69, 0.13)",
  borderRadius: 34,
  height: "88%",
  inset: "20px -10px auto 30px",
  position: "absolute",
  transform: "rotate(-4deg)"
} satisfies CSSProperties

const demoCardStyle = {
  background: "#fffaf2",
  border: "1px solid #dec7a8",
  borderRadius: 28,
  boxShadow: "0 28px 80px rgba(107, 67, 36, 0.15)",
  overflow: "hidden",
  position: "relative"
} satisfies CSSProperties

const browserBarStyle = {
  alignItems: "center",
  background: "#fff3df",
  borderBottom: "1px solid #ead8bf",
  display: "flex",
  gap: 8,
  padding: "14px 16px"
} satisfies CSSProperties

const dotStyle = {
  borderRadius: 999,
  height: 10,
  width: 10
} satisfies CSSProperties

const browserTitleStyle = {
  color: "#7e654d",
  fontSize: 12,
  marginLeft: "auto"
} satisfies CSSProperties

const demoBodyStyle = {
  display: "grid",
  gap: 12,
  padding: 20
} satisfies CSSProperties

const demoTitleStyle = {
  fontSize: 30,
  letterSpacing: "-0.06em",
  lineHeight: 0.95,
  margin: "6px 0 4px"
} satisfies CSSProperties

const demoFlowStyle = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))"
} satisfies CSSProperties

const demoLabelStyle = {
  color: "#8a6c4f",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
  margin: 0,
  textTransform: "uppercase"
} satisfies CSSProperties

const miniLabelStyle = {
  display: "block",
  fontSize: 10,
  fontWeight: 950,
  letterSpacing: "0.12em",
  marginBottom: 6,
  textTransform: "uppercase"
} satisfies CSSProperties

const demoColumnStyle = {
  borderRadius: 14,
  minHeight: 214,
  padding: 12
} satisfies CSSProperties

const demoListStyle = {
  display: "grid",
  gap: 9
} satisfies CSSProperties

const demoListItemStyle = {
  background: "rgba(255, 250, 242, 0.72)",
  borderRadius: 10,
  color: "#3d3026",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.25,
  padding: "9px 10px"
} satisfies CSSProperties

const filledStatusStyle = {
  background: "#251c15",
  borderRadius: 999,
  color: "#fff8ec",
  fontWeight: 950,
  padding: 14,
  textAlign: "center"
} satisfies CSSProperties

const demoVideoFrameStyle = {
  aspectRatio: "16 / 10",
  background: "#251c15",
  maxHeight: 360,
  overflow: "hidden"
} satisfies CSSProperties

const demoVideoStyle = {
  display: "block",
  height: "100%",
  objectFit: "cover",
  width: "100%"
} satisfies CSSProperties

const demoShowcaseGridStyle = {
  alignItems: "center",
  display: "grid",
  gap: 36,
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
} satisfies CSSProperties

const differentiatorCopyStyle = {
  maxWidth: 520
} satisfies CSSProperties

const differentiatorTitleStyle = {
  fontSize: "clamp(28px, 3.5vw, 40px)",
  letterSpacing: "-0.06em",
  lineHeight: 1,
  margin: "0 0 22px"
} satisfies CSSProperties

const differentiatorListStyle = {
  display: "grid",
  gap: 14,
  listStyle: "none",
  margin: 0,
  padding: 0
} satisfies CSSProperties

const differentiatorItemStyle = {
  background: "#fff8ec",
  border: "1px solid #e4cfb3",
  borderRadius: 16,
  padding: "14px 16px"
} satisfies CSSProperties

const differentiatorItemTitleStyle = {
  display: "block",
  fontSize: 15,
  letterSpacing: "-0.03em",
  marginBottom: 4
} satisfies CSSProperties

const differentiatorItemTextStyle = {
  color: "#6c5a4a",
  fontSize: 14,
  lineHeight: 1.45,
  margin: 0
} satisfies CSSProperties

const codeStyle = {
  background: "#f4e6d2",
  borderRadius: 6,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12,
  padding: "2px 6px"
} satisfies CSSProperties

const howItWorksSectionStyle = {
  display: "grid",
  gap: 28,
  marginTop: 36
} satisfies CSSProperties

const stepsStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))"
} satisfies CSSProperties

const stepCardStyle = {
  background: "#fff8ec",
  border: "1px solid #e4cfb3",
  borderRadius: 20,
  padding: 16
} satisfies CSSProperties

const stepNumberStyle = {
  color: "#9a7048",
  fontSize: 13,
  fontWeight: 950
} satisfies CSSProperties

const stepTitleStyle = {
  fontSize: 18,
  letterSpacing: "-0.04em",
  margin: "8px 0 6px"
} satisfies CSSProperties

const stepTextStyle = {
  color: "#6c5a4a",
  fontSize: 14,
  lineHeight: 1.45,
  margin: 0
} satisfies CSSProperties

const proofSectionStyle = {
  alignItems: "start",
  display: "grid",
  gap: 18,
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  marginTop: 38
} satisfies CSSProperties

const sectionLabelStyle = {
  color: "#9a7048",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.12em",
  margin: "0 0 8px",
  textTransform: "uppercase"
} satisfies CSSProperties

const sectionTitleStyle = {
  fontSize: "clamp(30px, 4vw, 44px)",
  letterSpacing: "-0.06em",
  lineHeight: 0.98,
  margin: 0
} satisfies CSSProperties

const proofGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
} satisfies CSSProperties

const proofPillStyle = {
  background: "#251c15",
  borderRadius: 999,
  color: "#fff8ec",
  fontSize: 14,
  fontWeight: 900,
  padding: "10px 13px"
} satisfies CSSProperties

const trustNoteStyle = {
  alignItems: "center",
  background: "#fff8ec",
  border: "1px solid #e4cfb3",
  borderRadius: 22,
  display: "flex",
  gap: 12,
  marginTop: 32,
  padding: 16
} satisfies CSSProperties

const trustIconStyle = {
  alignItems: "center",
  background: "#eaffd4",
  borderRadius: 999,
  color: "#4f7a2b",
  display: "inline-flex",
  flex: "0 0 auto",
  fontWeight: 950,
  height: 28,
  justifyContent: "center",
  width: 28
} satisfies CSSProperties

const trustTextStyle = {
  color: "#5b4b3e",
  lineHeight: 1.45,
  margin: 0
} satisfies CSSProperties

const inlineLinkStyle = {
  color: "#2c2118",
  fontWeight: 900
} satisfies CSSProperties
