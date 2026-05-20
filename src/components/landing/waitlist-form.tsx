import type { CSSProperties } from "react"

export function WaitlistForm() {
  return (
    <form
      action="https://formspree.io/f/mzdwzkjl"
      id="waitlist"
      method="POST"
      style={waitlistFormStyle}>
      <input name="_subject" type="hidden" value="New Filler beta signup" />
      <input name="source" type="hidden" value="landing-page-hero" />
      <label style={waitlistLabelStyle} htmlFor="waitlist-email">
        Want early access?
      </label>
      <div style={waitlistRowStyle}>
        <input
          autoComplete="email"
          id="waitlist-email"
          name="email"
          placeholder="your@email.com"
          required
          style={waitlistInputStyle}
          type="email"
        />
        <button style={waitlistButtonStyle} type="submit">
          Notify me
        </button>
      </div>
      <p style={waitlistHintStyle}>
        Join the beta list. We&apos;ll only email you about Filler access.
      </p>
    </form>
  )
}

const waitlistFormStyle = {
  background: "rgba(255, 248, 236, 0.78)",
  border: "1px solid #e4cfb3",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(107, 67, 36, 0.08)",
  marginBottom: 22,
  maxWidth: 520,
  padding: 14
} satisfies CSSProperties

const waitlistLabelStyle = {
  color: "#805834",
  display: "block",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: "0.12em",
  marginBottom: 8,
  textTransform: "uppercase"
} satisfies CSSProperties

const waitlistRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8
} satisfies CSSProperties

const waitlistInputStyle = {
  background: "#fffaf2",
  border: "1px solid #d6b995",
  borderRadius: 999,
  color: "#251c15",
  flex: "1 1 220px",
  font: "inherit",
  minWidth: 0,
  padding: "13px 14px"
} satisfies CSSProperties

const waitlistButtonStyle = {
  background: "#251c15",
  border: "1px solid #251c15",
  borderRadius: 999,
  color: "#fff8ec",
  cursor: "pointer",
  font: "inherit",
  fontWeight: 950,
  padding: "13px 16px"
} satisfies CSSProperties

const waitlistHintStyle = {
  color: "#7b6755",
  fontSize: 13,
  lineHeight: 1.4,
  margin: "9px 0 0"
} satisfies CSSProperties
