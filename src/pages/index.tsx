import Head from "next/head"

import { InstallCta } from "~components/landing/install-cta"
import { WaitlistForm } from "~components/landing/waitlist-form"

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

type FillExampleItem = string

const FILL_EXAMPLE: {
  label: string
  variant?: "profile" | "filled"
  items: FillExampleItem[]
}[] = [
  {
    label: "Form asks",
    items: [
      "When did you finish college?",
      "Tell us about yourself",
      "How did you hear about us?"
    ]
  },
  {
    label: "Your profile",
    variant: "profile",
    items: [
      "Graduation year: 2025",
      "I build small tools and like teams that ship fast.",
      "—"
    ]
  },
  {
    label: "Filled",
    variant: "filled",
    items: ["2025", "I build small tools and like teams that ship fast.", "Friend told me about it"]
  }
]

export default function IndexPage() {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Filler — forms filled in one click</title>
      </Head>
      <main className="landing">
          <header className="landing-top">
            <div className="landing-inner">
            <nav aria-label="Main navigation" className="landing-nav">
              <a className="landing-brand" href="/">
                Filler
              </a>
              <div className="landing-nav-links">
                <a href="#proof">Example</a>
                <a href="#process">How it works</a>
                <a href="#privacy">Privacy</a>
              </div>
              <InstallCta className="landing-btn landing-btn-small" />
            </nav>

            <div className="landing-intro">
              <p className="landing-kicker">Chrome extension</p>
              <h1>Forms filled in one click.</h1>
              <p className="landing-deck">
                You&apos;ve answered these questions before — just not on this
                exact form. Filler keeps your details in the extension and writes
                them in when you click Fill.
              </p>
              <p className="landing-aside">
                It won&apos;t submit for you. Anything it&apos;s unsure about
                gets flagged so you can read it first.
              </p>
              <div className="landing-intro-actions">
                <InstallCta className="landing-btn" />
                <a className="landing-text-link" href="#proof">
                  See an example ↓
                </a>
              </div>
            </div>
            </div>
          </header>

          <section className="landing-proof" id="proof">
            <div className="landing-inner">
              <div className="landing-proof-head">
                <h2>Every form asks differently.</h2>
                <p>
                  The easy stuff comes from your profile. Answers you&apos;ve
                  saved before get reused. For everything else, Filler takes a
                  guess — and lets you check before you send.
                </p>
              </div>

              <div className="landing-proof-grid">
                <FillFlowDemo />
                <DemoVideo />
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
                <h2>Worth trying on the next form you don&apos;t want to type through.</h2>
                <p>Add it to Chrome, or join the beta list.</p>
              </div>
              <div className="landing-close-actions">
                <InstallCta className="landing-btn landing-btn-invert" />
                <WaitlistForm />
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
      <div className="landing-demo-columns">
        {FILL_EXAMPLE.map((column) => {
          const variant = column.variant

          return (
            <div
              className={
                variant
                  ? `landing-demo-col landing-demo-col-${variant}`
                  : "landing-demo-col"
              }
              key={column.label}>
              <span className="landing-demo-label">{column.label}</span>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )
        })}
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
