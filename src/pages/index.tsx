import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { WaitlistForm } from "~components/landing/waitlist-form"
import { absoluteUrl, CHROME_STORE_URL } from "~lib/site"

const DEMO_VIDEO_URL = "https://files.catbox.moe/6ggdog.mp4"

const STEPS = [
  {
    number: "1",
    title: "Put your info in once",
    text: "Name, work, school, links — plus any long answers you’re tired of retyping."
  },
  {
    number: "2",
    title: "Open the form",
    text: "Google Form, company survey, signup page. Whatever’s in front of you."
  },
  {
    number: "3",
    title: "Click Fill",
    text: "Filler writes what it can. You read the rest, edit if you want, and submit yourself."
  }
] as const

const POINTS = [
  {
    title: "Reads the question",
    text: (
      <>
        Chrome autofill cares about <code>name=&quot;email&quot;</code>. Filler
        reads what the form actually asks — &quot;When did you finish
        college?&quot; gets your graduation year, not your school name.
      </>
    )
  },
  {
    title: "Reuses what you wrote",
    text: "Got a good \"about me\" paragraph? Save it. Filler drops it in when a similar question shows up on a different form."
  },
  {
    title: "Guesses when it has to",
    text: "For questions you never saved an answer to, Filler takes a shot based on your profile and flags it for you to check."
  }
] as const

const FILL_EXAMPLE_ROWS = [
  {
    ask: "When did you finish college?",
    filled: "2025",
    profile: "Graduation year: 2025",
    source: "profile"
  },
  {
    ask: "Tell us about yourself",
    filled: "I build small tools and like teams that ship fast.",
    profile: "I build small tools and like teams that ship fast.",
    source: "reused"
  },
  {
    ask: "How did you hear about us?",
    filled: "Friend told me about it",
    profile: "Not in profile",
    profileMissing: true,
    source: "guess"
  }
] as const

const FILL_SOURCE_LABELS = {
  guess: "Guess — review",
  profile: "From profile",
  reused: "Reused answer"
} as const

const HOME_DESCRIPTION =
  "Chrome extension that fills web forms from a saved profile. One click for Google Forms, job applications, surveys, and signups."

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  applicationCategory: "BrowserApplication",
  description: HOME_DESCRIPTION,
  downloadUrl: CHROME_STORE_URL,
  name: "Filler",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  operatingSystem: "Chrome",
  url: absoluteUrl("/")
} as const

export default function IndexPage() {
  return (
    <>
      <PageHead
        description={HOME_DESCRIPTION}
        jsonLd={HOME_JSON_LD}
        path="/"
        title="Filler — stop retyping the same form answers"
      />
      <main className="landing">
          <header className="landing-top">
            <div className="landing-inner">
            <nav aria-label="Main navigation" className="landing-nav">
              <LandingBrand />
              <div className="landing-nav-links">
                <a href="#proof">Example</a>
                <a href="#process">How it works</a>
                <a href="#privacy">Privacy</a>
              </div>
              <InstallCta className="landing-btn landing-btn-small" location="nav" />
            </nav>

            <div className="landing-hero-grid">
              <div className="landing-intro">
                <p className="landing-kicker">Chrome extension · free</p>
                <h1>Stop retyping the same answers on every form.</h1>
                <p className="landing-deck">
                  Save your details once. Click Fill on Google Forms, job
                  applications, surveys, and signups — even when every form
                  asks slightly differently.
                </p>
                <div className="landing-intro-actions">
                  <InstallCta
                    className="landing-btn"
                    label="Add to Chrome — it's free"
                    location="hero"
                    showMeta
                    variant="primary"
                  />
                  <a className="landing-text-link" href="#proof">
                    See how it works ↓
                  </a>
                </div>
                <p className="landing-aside">
                  You stay in control — Filler never submits for you, and
                  anything it&apos;s unsure about gets flagged for you to check.
                </p>
              </div>
              <div className="landing-hero-demo">
                <FillFlowDemo />
              </div>
            </div>
            </div>
          </header>

          <section className="landing-proof" id="proof">
            <div className="landing-inner">
              <div className="landing-proof-layout">
                <div className="landing-proof-head">
                  <h2>Every form asks differently.</h2>
                  <p>
                    The easy stuff comes from your profile. Answers you&apos;ve
                    saved before get reused. For everything else, Filler takes a
                    guess — and lets you check before you send.
                  </p>
                </div>

                <div className="landing-proof-media">
                  <DemoVideo />
                </div>
              </div>
            </div>
          </section>

          <section className="landing-process" id="process">
            <div className="landing-inner">
              <ol className="landing-steps">
                {STEPS.map((step) => (
                  <li className="landing-step" key={step.number}>
                    <span className="landing-step-num">{step.number}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="landing-points">
                {POINTS.map((point) => (
                  <article className="landing-point" key={point.title}>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </article>
                ))}
              </div>

              <div className="landing-handles" id="handles">
                <div>
                  <h4>Sites</h4>
                  <p>Google Forms, Ashby, Tally, most web forms</p>
                </div>
                <div>
                  <h4>Controls</h4>
                  <p>Text fields, dropdowns, radios, textareas</p>
                </div>
              </div>
            </div>
          </section>

          <section className="landing-close">
            <div className="landing-inner landing-close-inner">
              <div>
                <h2>Try it on the next form you don&apos;t want to type through.</h2>
                <p>Free on the Chrome Web Store. Setup takes about two minutes.</p>
              </div>
              <div className="landing-close-actions">
                <InstallCta
                  className="landing-btn landing-btn-invert"
                  label="Add to Chrome — it's free"
                  location="footer"
                  variant="primary"
                />
                <p className="landing-close-waitlist">
                  Want early access to new features?{" "}
                  <a href="#waitlist">Join the beta list</a>
                </p>
                <details className="landing-waitlist-details" id="waitlist">
                  <summary className="landing-waitlist-summary">
                    Beta waitlist
                  </summary>
                  <WaitlistForm />
                </details>
              </div>
            </div>
          </section>

          <footer className="landing-footer" id="privacy">
            <div className="landing-inner landing-footer-inner">
              <p>
                Your profile stays on your device until you click Fill. We only
                send it to our server to figure out the answers — no ads, no
                background snooping.{" "}
                <a href="/privacy">Privacy policy</a>
              </p>
              <span>© {new Date().getFullYear()} Filler</span>
            </div>
          </footer>
      </main>
    </>
  )
}

function FillFlowDemo() {
  return (
    <div
      aria-label="Example of Filler matching form questions to profile answers"
      className="landing-demo">
      <div className="landing-demo-bar">
        <span>Example form</span>
      </div>
      <div className="landing-demo-grid">
        <div aria-hidden="true" className="landing-demo-head">
          <span>Form asks</span>
          <span>Your profile</span>
          <span>Filled</span>
        </div>
        {FILL_EXAMPLE_ROWS.map((row) => (
          <div className="landing-demo-row" key={row.ask}>
            <div className="landing-demo-cell landing-demo-cell-ask">
              <span className="landing-demo-cell-label">Form asks</span>
              {row.ask}
            </div>
            <div
              className={
                "profileMissing" in row && row.profileMissing
                  ? "landing-demo-cell landing-demo-cell-profile landing-demo-cell-profile-missing"
                  : "landing-demo-cell landing-demo-cell-profile"
              }>
              <span className="landing-demo-cell-label">Your profile</span>
              {row.profile}
            </div>
            <div
              className={
                row.source === "guess"
                  ? "landing-demo-cell landing-demo-cell-filled landing-demo-cell-guess"
                  : "landing-demo-cell landing-demo-cell-filled"
              }>
              <span className="landing-demo-cell-label">Filled</span>
              {row.filled}
              <em>{FILL_SOURCE_LABELS[row.source]}</em>
            </div>
          </div>
        ))}
      </div>
      <p className="landing-demo-foot">Filled in one click</p>
    </div>
  )
}

function DemoVideo() {
  return (
    <div aria-label="Filler demo video" className="landing-video">
      <div className="landing-demo-bar">
        <span>Screen recording</span>
      </div>
      <video
        autoPlay
        controls
        loop
        muted
        playsInline
        preload="metadata"
        src={DEMO_VIDEO_URL}
      />
    </div>
  )
}
