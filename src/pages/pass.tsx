import { useRouter } from "next/router"
import { useState, type FormEvent } from "react"

import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { trackEvent } from "~lib/analytics"

const PASS_DESCRIPTION =
  "Job Hunt Pass for Filler: answers to custom job application questions, written from the job post and your profile. $5 for 30 days, never auto-renews."

const WAITLIST_URL = "https://formspree.io/f/mzdwzkjl"

type EmailStatus = "idle" | "sending" | "sent" | "error"

export default function PassPage() {
  const router = useRouter()
  const from = typeof router.query.from === "string" ? router.query.from : "direct"
  const [wantsPass, setWantsPass] = useState(false)
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle")

  function onBuyClick() {
    trackEvent("pass_buy_click", { from })
    setWantsPass(true)
  }

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailStatus("sending")

    try {
      const response = await fetch(WAITLIST_URL, {
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Formspree error")
      }

      trackEvent("pass_email_submit", { from })
      setEmailStatus("sent")
    } catch {
      setEmailStatus("error")
    }
  }

  return (
    <>
      <PageHead description={PASS_DESCRIPTION} path="/pass" title="Job Hunt Pass" />
      <main className="landing landing-doc">
        <article className="landing-inner">
          <nav
            aria-label="Main navigation"
            className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] Job Hunt Pass</p>
            <h1 className="landing-doc-title">
              Answers written for the job you&apos;re applying to.
            </h1>
            <p className="landing-pass-lead">
              Free Filler fills your details and reuses answers you saved. For
              questions like &quot;Why this role?&quot; it writes a draft from
              your profile alone, so the draft reads the same for every job.
              The Job Hunt Pass also reads the job post on the page and writes
              the answer for that job.
            </p>
          </header>

          <section className="landing-doc-section">
            <h2>Same question, two drafts</h2>
            <div className="landing-pass-compare">
              <div className="landing-pass-card">
                <p className="landing-pass-card-label">Question</p>
                <p>Why do you want to work here?</p>
              </div>
              <div className="landing-pass-card">
                <p className="landing-pass-card-label">Free Filler</p>
                <p>
                  This role aligns with my passion for building useful products
                  and my experience working on small teams.
                </p>
              </div>
              <div className="landing-pass-card landing-pass-card-strong">
                <p className="landing-pass-card-label">With the pass</p>
                <p>
                  Your post asks for someone who has worked on scheduling
                  tools. At my last job I built the interview scheduler our
                  recruiters used every day, so this team&apos;s work is the
                  part I&apos;d be most useful on.
                </p>
              </div>
            </div>
            <p className="landing-pass-note">
              Example with a made-up profile. You still read and edit every
              answer, and Filler never submits for you.
            </p>
          </section>

          <section className="landing-doc-section">
            <h2>$5 for 30 days</h2>
            <p>
              Pay once for a month of job hunting. It never auto-renews, so
              nothing charges you after you find the job. Basic autofill stays
              free.
            </p>

            {wantsPass ? (
              <div className="landing-pass-soon" role="status">
                <p>
                  <strong>Not ready yet.</strong> We&apos;re checking whether
                  enough people want this before we build it. Leave your email
                  and you&apos;ll get one message when it&apos;s ready.
                </p>
                {emailStatus === "sent" ? (
                  <p>Thanks, you&apos;re on the list.</p>
                ) : (
                  <form className="landing-pass-form" onSubmit={onEmailSubmit}>
                    <input
                      name="_subject"
                      type="hidden"
                      value="Job Hunt Pass interest"
                    />
                    <input name="source" type="hidden" value={`job-hunt-pass-${from}`} />
                    <input
                      aria-label="Email"
                      autoComplete="email"
                      className="landing-pass-input"
                      name="email"
                      placeholder="your@email.com"
                      required
                      type="email"
                    />
                    <button
                      className="landing-btn landing-btn-small"
                      disabled={emailStatus === "sending"}
                      type="submit">
                      {emailStatus === "sending" ? "Sending..." : "Email me"}
                    </button>
                    {emailStatus === "error" ? (
                      <p className="landing-pass-note">
                        Could not save that. Try again in a moment.
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            ) : (
              <button
                className="landing-btn landing-pass-buy"
                onClick={onBuyClick}
                type="button">
                Get the pass for $5
              </button>
            )}
          </section>
        </article>
      </main>
    </>
  )
}
