import { trackEvent } from "~lib/analytics"

export function WaitlistForm() {
  return (
    <form
      action="https://formspree.io/f/mzdwzkjl"
      className="landing-waitlist"
      method="POST"
      onSubmit={(event) => {
        trackEvent("waitlist_submit")
        const email = new FormData(event.currentTarget).get("email")
        // keepalive lets the auto-reply request finish while the form
        // navigates to Formspree.
        fetch("/api/waitlist-reply", {
          body: JSON.stringify({ email, kind: "beta" }),
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          method: "POST"
        }).catch(() => {})
      }}>
      <input name="_subject" type="hidden" value="New Filler beta signup" />
      <input name="source" type="hidden" value="landing-page-close" />
      <label className="landing-waitlist-label" htmlFor="waitlist-email">
        Beta access
      </label>
      <div className="landing-waitlist-row">
        <input
          autoComplete="email"
          className="landing-waitlist-input"
          id="waitlist-email"
          name="email"
          placeholder="your@email.com"
          required
          type="email"
        />
        <button className="landing-waitlist-button" type="submit">
          Notify me
        </button>
      </div>
      <p className="landing-waitlist-hint">
        Join the beta. We&apos;ll email you when there&apos;s something to try.
      </p>
    </form>
  )
}
