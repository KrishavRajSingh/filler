import { useEffect, useRef } from "react"

import { Bubble, FillRace } from "~components/landing/fill-race"
import { InstallCta } from "~components/landing/install-cta"
import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { TimeSheet } from "~components/landing/time-sheet"
import { WaitlistForm } from "~components/landing/waitlist-form"
import { trackEvent } from "~lib/analytics"
import { absoluteUrl, CHROME_STORE_URL } from "~lib/site"

const DEMO_VIDEO_URL = "/demo/filler-fill.mp4"
const DEMO_POSTER_URL = "/demo/filler-fill-poster.jpg"

const MARKS = [
  {
    mark: "filled",
    title: "Filled in",
    text: "It comes from your profile or an answer you saved, even when the form words the question differently.",
    ask: "What year did you finish college?",
    answer: "2024",
    source: "Your profile says: Graduation year, 2024"
  },
  {
    mark: "guess",
    title: "A guess to check",
    text: "The profile only hints at it, so Filler answers, outlines the field and tells you to look.",
    ask: "How did you hear about us?",
    answer: "LinkedIn",
    source: "Not a saved answer, so check it"
  },
  {
    mark: "blank",
    title: "Left for you",
    text: "File uploads, checkboxes, passwords and payment fields stay empty, and so does anything your profile says nothing about.",
    ask: "Resume",
    answer: "",
    source: "Filler doesn't touch this"
  }
] as const

const STEPS = [
  {
    title: "Save your details once",
    text: "Work, school, links and the answers you're tired of rewriting."
  },
  {
    title: "Open any application",
    text: "Filler reads the questions on the page. There's nothing to set up per site."
  },
  {
    title: "Click Fill, then read it",
    text: "Change what you like and submit it yourself."
  }
] as const

const HOME_DESCRIPTION =
  "Free Chrome extension that autofills job applications, Google Forms and signups from a profile you save once. Reuses past answers, flags guesses."

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
        title="Filler: autofill job applications and Google Forms in one click"
      />
      <main className="sheet">
        <span aria-hidden="true" className="sheet-track" />

        <header className="sheet-hero">
          <div className="sheet-inner">
            <nav aria-label="Main navigation" className="sheet-nav">
              <LandingBrand />
              <div className="sheet-nav-links">
                <a href="#marks">How it answers</a>
                <a href="#proof">Recording</a>
                <a href="#privacy">Privacy</a>
                <a href="/job-application-autofill">Job sites</a>
                <a href="/blog">Blog</a>
              </div>
              <InstallCta className="sheet-cta sheet-cta-small" location="nav" />
            </nav>

            <h1>You uploaded your resume. Now type it all again?</h1>

            <div className="sheet-offer">
              <p>
                Filler is a free Chrome extension that fills{" "}
                <a href="/job-application-autofill">job applications</a> from a
                profile you save once. It reads each question, flags its
                guesses and never submits for you.
              </p>
              <div className="sheet-offer-action">
                <InstallCta
                  className="sheet-cta"
                  label="Add to Chrome, it's free"
                  location="hero"
                />
                <span>No account needed</span>
              </div>
            </div>

            <div className="sheet-paper">
              <FillRace />
            </div>
          </div>
        </header>

        <section className="sheet-marks" id="marks">
          <div className="sheet-inner">
            <h2>Every answer gets one of three marks.</h2>
            <div className="sheet-mark-list">
              {MARKS.map((item) => (
                <article className="sheet-mark" key={item.title}>
                  <Bubble mark={item.mark} />
                  <div className="sheet-mark-copy">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <div className="sheet-mark-example">
                    <span className="sheet-field-label">{item.ask}</span>
                    <span className={`sheet-input is-example has-${item.mark}`}>
                      <span className="sheet-input-value">{item.answer}</span>
                    </span>
                    <span className="sheet-mark-source">{item.source}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sheet-time" id="time">
          <div className="sheet-inner">
            <h2>What does your week cost you?</h2>
            <TimeSheet />
            <div className="sheet-time-action">
              <InstallCta
                className="sheet-cta"
                label="Add to Chrome, it's free"
                location="time_sheet"
              />
              <p>
                Applying a lot? Get long answers written for the job post.{" "}
                <a
                  href="/pass?from=time_sheet"
                  onClick={() =>
                    trackEvent("pass_click", { location: "time_sheet" })
                  }>
                  Job Hunt Pass, $5 for 30 days
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="sheet-proof" id="proof">
          <div className="sheet-inner">
            <h2>The real extension, at real speed.</h2>
            <DemoVideo />
            <p>
              A test application and a made-up applicant, with no sound and no
              speed-up. The orange outline is what you see on a guess.
            </p>
          </div>
        </section>

        <section className="sheet-how" id="process">
          <div className="sheet-inner sheet-how-grid">
            <div>
              <h2>Three steps, and the last one is yours.</h2>
              <ol className="sheet-steps">
                {STEPS.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="sheet-where" id="handles">
              <h3>Where it works</h3>
              <p>
                On live{" "}
                <a href="/job-application-autofill">
                  Greenhouse, Lever and Ashby
                </a>{" "}
                applications it filled 4 to 9 fields in 5 to 6 seconds, which is
                rarely all of them. On a long Ashby form it filled 5, 2 of them
                guesses, in 4.7 s. The resume, custom dropdowns and voluntary
                surveys stay for you. Also Google Forms, Tally, signups and{" "}
                <a href="/forms">provider credentialing forms</a>. Workday
                isn&apos;t tested yet.
              </p>
              <h3>What it fills</h3>
              <p>Text fields, dropdowns, radios and long answers.</p>
            </div>
          </div>
        </section>

        <section className="sheet-close">
          <div className="sheet-inner sheet-close-inner">
            <h2>Try it on your next application.</h2>
            <div className="sheet-close-action">
              <InstallCta
                className="sheet-cta"
                label="Add to Chrome, it's free"
                location="footer"
              />
              <details className="sheet-beta" id="waitlist">
                <summary>Join the beta list for new features</summary>
                <WaitlistForm />
              </details>
            </div>
          </div>
        </section>

        <div className="landing">
          <footer className="landing-footer" id="privacy">
            <div className="landing-inner landing-footer-inner">
              <p>
                Your profile stays on your device until you click Fill. We only
                send it to our server and an AI model to figure out the answers — no ads, no
                background snooping.{" "}
                <a href="/privacy">Privacy policy</a>
              </p>
              <span>
                <a href="/blog">Blog</a>
              </span>
              <span>
                <a href="/forms">Form guides</a>
              </span>
              <span>
                <a href="/job-application-autofill">Job application autofill</a>
              </span>
              <span>© {new Date().getFullYear()} Filler</span>
              <div className="landing-footer-badges">
              <a
                data-launchpadly-badge="filler"
                data-launchpadly-badge-variant="light"
                href="https://launchpadly.co/startup/filler?ref=badge"
                rel="noopener noreferrer"
                target="_blank">
                <img
                  alt="Launchpadly Startup Directory"
                  height="48"
                  src="https://launchpadly.co/embed/badges/startup/filler.svg?variant=light"
                  style={{ display: "block", border: 0 }}
                  width="220"
                />
              </a>
              <a href="https://starterbest.com" rel="noopener noreferrer" target="_blank">
                <img
                  alt="Featured on Starter Best"
                  src="https://starterbest.com/badages-awards.svg"
                  style={{ height: 54, width: "auto" }}
                />
              </a>
              <a
                href="https://kickproduct.com/products/6ac9f37b964f867e7b9032a3"
                rel="noopener noreferrer"
                target="_blank">
                <img
                  alt="Listed on Kick Product"
                  src="https://www.kickproduct.com/listedbadge.png"
                  width="250"
                />
              </a>
              <a
                data-publishyoursaas-badge="filler-live"
                href="https://publishyoursaas.com/listing/filler-live"
                rel="noopener"
                target="_blank">
                <img
                  alt="Filler is listed on publishyoursaas"
                  height="60"
                  src="https://publishyoursaas.com/publishyoursaas-badge.svg"
                  width="240"
                />
              </a>
              <a href="https://wired.business" target="_blank">
                <img
                  alt="Featured on Wired Business"
                  height="54"
                  src="https://wired.business/badge0-light.svg"
                  width="200"
                />
              </a>
              <a href="https://smartkithub.com/product/filler" target="_blank">
                <img
                  alt="Smart Kit Hub"
                  height="54"
                  loading="lazy"
                  src="https://smartkithub.com/assets/images/badge.png"
                />
              </a>
              <a href="https://thecoretools.com/tool/filler" target="_blank">
                <img
                  alt="The Core Tools"
                  height="54"
                  loading="lazy"
                  src="https://thecoretools.com/assets/images/badge.png"
                />
              </a>
              <a href="https://twelve.tools" target="_blank">
                <img
                  alt="Featured on Twelve Tools"
                  height="40"
                  src="https://twelve.tools/badge1-light.svg"
                  width="148"
                />
              </a>
              <a href="https://ashlist.com/product/filler" target="_blank">
                <img
                  alt="Ash List"
                  height="54"
                  loading="lazy"
                  src="https://ashlist.com/assets/images/badge.png"
                />
              </a>
              <a href="https://fastlaunch.io" rel="noopener" target="_blank">
                <img
                  alt="Featured on FastLaunch"
                  height="60"
                  src="https://fastlaunch.io/images/badges/featured-light.svg"
                  width="221"
                />
              </a>
              </div>
              <p className="landing-footer-listed">
                Listed on{" "}
                <a href="https://mossai.org" title="MossAI Tools">MossAI Tools</a>
                {" · "}
                <a href="https://whatisaitools.com/" title="What Is Ai Tools">What Is Ai Tools</a>
                {" · "}
                <a href="https://www.aitoolzdir.com" target="_blank">AI Toolz Dir</a>
                {" · "}
                <a href="https://indieai.directory/tools/filler/" rel="noopener" target="_blank">
                  Filler on IndieAI Directory
                </a>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </>
  )
}

function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (
      !video ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    let tracked = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined)
          if (!tracked) {
            tracked = true
            trackEvent("demo_video_view")
          }
        } else {
          video.pause()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      aria-label="Screen recording: an empty job application fills in after Filler runs, with one field outlined as a guess to check"
      className="sheet-video"
      controls
      height={652}
      loop
      muted
      playsInline
      poster={DEMO_POSTER_URL}
      preload="metadata"
      ref={videoRef}
      src={DEMO_VIDEO_URL}
      width={1280}
    />
  )
}
