import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { trackEvent } from "~lib/analytics"
import { CHROME_STORE_URL } from "~lib/site"

const REASONS = [
  { id: "wrong_fields", label: "Filled fields wrong" },
  { id: "site_broken", label: "Didn't work on a form I needed" },
  { id: "setup", label: "Profile setup was too much" },
  { id: "better", label: "Found something better" },
  { id: "done", label: "Done applying" },
  { id: "trying", label: "Was just trying it" },
  { id: "other", label: "Something else" }
] as const

const NOTE_HINTS: Record<string, string> = {
  better: "Which one?",
  site_broken: "Which site or form?"
}

// Chrome opens this page on uninstall (setUninstallURL in src/background)
export default function ByePage() {
  const router = useRouter()
  const [reason, setReason] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [noteSent, setNoteSent] = useState(false)

  const ref: Record<string, string> = {}
  for (const key of ["v", "fills", "days"]) {
    const value = router.query[key]
    if (typeof value === "string" && value) ref[key] = value
  }

  useEffect(() => {
    if (!router.isReady) return
    trackEvent("uninstalled", ref)
    // ref is rebuilt each render from router.query; fire once when it's ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  function pick(id: string) {
    setReason(id)
    trackEvent("uninstall_reason", { ...ref, reason: id })
  }

  function sendNote() {
    if (!note.trim()) return
    trackEvent("uninstall_note", {
      ...ref,
      reason: reason ?? "",
      text: note.trim().slice(0, 500)
    })
    setNoteSent(true)
  }

  return (
    <>
      <PageHead
        description="Tell us why you removed Filler."
        path="/bye"
        title="Filler was removed"
      />
      <Head>
        <meta content="noindex, nofollow" name="robots" />
      </Head>
      <main className="landing landing-doc">
        <article className="landing-inner">
          <nav
            aria-label="Main navigation"
            className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <h1 className="landing-doc-title">Filler was removed</h1>
            <p className="landing-pass-lead">
              One tap helps: what made you remove it?
            </p>
          </header>

          <section className="landing-doc-section">
            <div className="landing-bye-reasons">
              {REASONS.map((r) => (
                <button
                  aria-pressed={reason === r.id}
                  className={`landing-btn landing-btn-small${reason === r.id ? "" : " landing-btn-invert landing-bye-reason"}`}
                  key={r.id}
                  onClick={() => pick(r.id)}
                  type="button">
                  {r.label}
                </button>
              ))}
            </div>

            {reason !== null && noteSent ? (
              <p className="landing-pass-soon" role="status">
                Thanks. We read every one of these.
              </p>
            ) : null}
            {reason !== null && !noteSent ? (
              <div className="landing-pass-soon">
                <p>Thanks. Anything we should fix? (optional)</p>
                <div className="landing-pass-form">
                  <input
                    aria-label="What should we fix?"
                    className="landing-pass-input"
                    maxLength={500}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={NOTE_HINTS[reason] ?? ""}
                    value={note}
                  />
                  <button
                    className="landing-btn landing-btn-small"
                    disabled={!note.trim()}
                    onClick={sendNote}
                    type="button">
                    Send
                  </button>
                </div>
              </div>
            ) : null}

            <p className="landing-pass-note">
              Removed it by mistake? <a href={CHROME_STORE_URL}>Add Filler back</a>.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
