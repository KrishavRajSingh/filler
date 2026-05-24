import { useEffect, useId, useRef, useState } from "react"

import { trackEvent } from "~lib/analytics"

const FORMSPREE_URL = "https://formspree.io/f/mzdwzkjl"

type InstallCtaLocation = "nav" | "hero" | "footer"

type MobileInstallModalProps = {
  location: InstallCtaLocation
  onClose: () => void
}

export function MobileInstallModal({
  location,
  onClose
}: MobileInstallModalProps) {
  const titleId = useId()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "submitting" | "sent" | "copy-success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    emailInputRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  async function captureLead(submittedEmail: string) {
    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: submittedEmail,
        source: `mobile-install-${location}`,
        _subject: "Filler mobile install link request"
      })
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    setErrorMessage("")

    const submittedEmail = email.trim()

    try {
      const [emailResponse] = await Promise.all([
        fetch("/api/send-install-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: submittedEmail })
        }),
        captureLead(submittedEmail)
      ])

      if (!emailResponse.ok) {
        const payload = (await emailResponse.json().catch(() => null)) as
          | { error?: string }
          | null

        setStatus("error")
        setErrorMessage(
          payload?.error ??
            "We saved your email, but could not send the link yet. Use copy link below."
        )
        trackEvent("mobile_install_email_submit", {
          location,
          delivered: "false"
        })
        return
      }

      setStatus("sent")
      trackEvent("mobile_install_email_submit", {
        location,
        delivered: "true"
      })
    } catch {
      setStatus("error")
      setErrorMessage("Something went wrong. Try copy link instead.")
      trackEvent("mobile_install_email_submit", {
        location,
        delivered: "false"
      })
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setStatus("copy-success")
      trackEvent("mobile_install_copy_link", { location })
    } catch {
      setErrorMessage("Could not copy the link. Bookmark this page instead.")
      setStatus("error")
    }
  }

  return (
    <div className="landing-mobile-modal-root">
      <button
        aria-label="Close"
        className="landing-mobile-modal-backdrop"
        onClick={onClose}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="landing-mobile-modal"
        role="dialog">
        <button
          aria-label="Close dialog"
          className="landing-mobile-modal-close"
          onClick={onClose}
          type="button">
          ×
        </button>

        {status === "sent" ? (
          <div className="landing-mobile-modal-success">
            <h2 id={titleId}>Check your inbox</h2>
            <p>
              We sent the install link to <strong>{email.trim()}</strong>. Open
              it on your computer and click Add to Chrome.
            </p>
            <button
              className="landing-btn landing-mobile-modal-action"
              onClick={onClose}
              type="button">
              Got it
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId}>Install on your computer</h2>
            <p className="landing-mobile-modal-lede">
              Filler is a Chrome extension for Mac, Windows, and Linux. Enter
              your email and we&apos;ll send you the install link for when
              you&apos;re at your desk.
            </p>

            <form className="landing-mobile-modal-form" onSubmit={handleSubmit}>
              <label className="landing-mobile-modal-label" htmlFor="mobile-install-email">
                Email
              </label>
              <div className="landing-mobile-modal-row">
                <input
                  autoComplete="email"
                  className="landing-mobile-modal-input"
                  id="mobile-install-email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  ref={emailInputRef}
                  required
                  type="email"
                  value={email}
                />
                <button
                  className="landing-btn landing-mobile-modal-submit"
                  disabled={status === "submitting"}
                  type="submit">
                  {status === "submitting" ? "Sending…" : "Email me the link"}
                </button>
              </div>
            </form>

            {status === "copy-success" ? (
              <p className="landing-mobile-modal-note landing-mobile-modal-note-success">
                Link copied. Paste it into a note or message and open it on your
                computer.
              </p>
            ) : (
              <button
                className="landing-mobile-modal-copy"
                onClick={handleCopyLink}
                type="button">
                Or copy link instead
              </button>
            )}

            {status === "error" && errorMessage ? (
              <p className="landing-mobile-modal-note landing-mobile-modal-note-error">
                {errorMessage}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
