import { useCallback, useEffect, useRef, useState } from "react"

import { trackEvent } from "~lib/analytics"

/**
 * Replays a recorded run of the real extension on a form we control:
 * 9 fields filled (1 flagged as a guess), resume and confirm box left alone, 3.0 s.
 * By hand is the same answers typed at 40 words a minute (200 characters a minute).
 */
const FILL_SECONDS = 3
const LAND_START_SECONDS = 2.4
const CHARS_PER_SECOND = 200 / 60

type Mark = "filled" | "guess" | "blank"

type Row = {
  label: string
  value: string
  mark: Mark
  kind?: "select" | "long" | "file" | "check"
}

const ROWS: Row[] = [
  { label: "Full name", mark: "filled", value: "Jordan Reyes" },
  { label: "Email", mark: "filled", value: "jordan.reyes@example.com" },
  { label: "Phone", mark: "filled", value: "(512) 555-0142" },
  { label: "LinkedIn profile", mark: "filled", value: "linkedin.com/in/jordanreyes" },
  { label: "Where do you work now?", mark: "filled", value: "Northwind Labs" },
  { label: "What year did you finish college?", mark: "filled", value: "2024" },
  {
    kind: "select",
    label: "Are you legally authorized to work in the US?",
    mark: "filled",
    value: "Yes"
  },
  {
    kind: "select",
    label: "How did you hear about us?",
    mark: "guess",
    value: "LinkedIn"
  },
  {
    kind: "long",
    label: "Tell us about a project you're proud of",
    mark: "filled",
    value:
      "I redesigned the checkout at Northwind Labs. Drop-off fell by a fifth, and I ran the user tests myself."
  },
  { kind: "file", label: "Resume", mark: "blank", value: "" },
  {
    kind: "check",
    label: "I confirm this application is accurate",
    mark: "blank",
    value: ""
  }
]

const TYPED_ROWS = ROWS.filter((row) => !row.kind || row.kind === "long")
const TYPED_CHARS = TYPED_ROWS.reduce((sum, row) => sum + row.value.length, 0)
const HAND_SECONDS = Math.round(TYPED_CHARS / CHARS_PER_SECOND)
const LANDING_ROWS = ROWS.filter((row) => row.mark !== "blank")

export const SHORT_FIELD_COUNT = TYPED_ROWS.filter((row) => !row.kind).length
export const SHORT_FIELDS_SECONDS = Math.round(
  TYPED_ROWS.filter((row) => !row.kind).reduce(
    (sum, row) => sum + row.value.length,
    0
  ) / CHARS_PER_SECOND
)

function formatClock(seconds: number) {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

function typedAt(seconds: number) {
  let chars = Math.floor(seconds * CHARS_PER_SECOND)
  for (const row of TYPED_ROWS) {
    if (chars < row.value.length) {
      return { label: row.label, text: row.value.slice(0, chars) }
    }
    chars -= row.value.length
  }
  return null
}

function landedCount(seconds: number) {
  if (seconds < LAND_START_SECONDS) return 0
  const progress =
    (seconds - LAND_START_SECONDS) / (FILL_SECONDS - LAND_START_SECONDS)
  return Math.min(
    LANDING_ROWS.length,
    Math.ceil(progress * LANDING_ROWS.length)
  )
}

export function Bubble({ mark }: { mark: Mark | "empty" }) {
  return <span aria-hidden="true" className={`sheet-bubble is-${mark}`} />
}

export function FillRace() {
  const [seconds, setSeconds] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)

  const play = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / 1000, HAND_SECONDS)
      setSeconds(elapsed)
      if (elapsed < HAND_SECONDS) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeconds(HAND_SECONDS)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          play()
        }
      },
      { threshold: 0.15 }
    )
    if (rootRef.current) observer.observe(rootRef.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameRef.current)
    }
  }, [play])

  const landed = landedCount(seconds)
  const fillDone = seconds >= FILL_SECONDS
  const handDone = seconds >= HAND_SECONDS
  const typed = typedAt(seconds)
  const landedRows = new Set(LANDING_ROWS.slice(0, landed))

  return (
    <div className="sheet-race" ref={rootRef}>
      <p className="sheet-sr">
        Re-creation of a recorded run on a test job application: Filler filled
        8 of 11 fields in 3 seconds, added 1 guess to check, and left the resume
        upload and the confirm box for the applicant. Typing the same answers at 40 words
        a minute takes about {HAND_SECONDS} seconds.
      </p>

      <div aria-hidden="true" className="sheet-clocks">
        <div className={fillDone ? "sheet-clock is-stopped" : "sheet-clock"}>
          <span className="sheet-clock-name">With Filler</span>
          <span className="sheet-clock-time">
            {Math.min(seconds, FILL_SECONDS).toFixed(1)} s
          </span>
          <span className="sheet-clock-note">
            {fillDone
              ? "Done. 8 filled, 1 to check, 2 left for you."
              : `Reading ${ROWS.length} questions`}
          </span>
        </div>
        <div className="sheet-clock sheet-clock-hand">
          <span className="sheet-clock-name">Typing by hand</span>
          <span className="sheet-clock-time">{formatClock(seconds)}</span>
          <span className="sheet-clock-note">
            {handDone || !typed ? (
              "Done typing. Now pick the dropdowns."
            ) : (
              <>
                {typed.label}: <b>{typed.text}</b>
                <i className="sheet-caret" />
              </>
            )}
          </span>
        </div>
      </div>
      <button
        className="sheet-replay"
        onClick={() => {
          trackEvent("demo_replay", { location: "hero" })
          play()
        }}
        type="button">
        Run it again
      </button>

      <div aria-hidden="true" className="sheet-app">
        <div className="sheet-app-head">
          <strong>Junior Product Designer</strong>
          <span>Tidewater Studio, Austin, TX</span>
        </div>
        <div className="sheet-app-grid">
          {ROWS.map((row) => {
            const isLanded = landedRows.has(row)
            const showBlank = row.mark === "blank" && fillDone
            return (
              <div
                className={[
                  "sheet-row",
                  row.kind ? `is-${row.kind}` : "",
                  isLanded ? `has-${row.mark}` : "",
                  showBlank ? "has-blank" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={row.label}>
                <Bubble
                  mark={isLanded ? row.mark : showBlank ? "blank" : "empty"}
                />
                <div className="sheet-field">
                  <span className="sheet-field-label">{row.label}</span>
                  {row.kind === "check" ? null : (
                    <span className="sheet-input">
                      {row.kind === "file" ? (
                        <span className="sheet-file">Choose file</span>
                      ) : null}
                      <span className="sheet-input-value">
                        {isLanded ? row.value : ""}
                      </span>
                      {row.kind === "select" ? (
                        <svg
                          className="sheet-chevron"
                          height="8"
                          viewBox="0 0 12 8"
                          width="12">
                          <path
                            d="M1 1.5 6 6.5l5-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      ) : null}
                    </span>
                  )}
                  {isLanded && row.mark === "guess" ? (
                    <span className="sheet-tag sheet-tag-guess">
                      Guess: check this
                    </span>
                  ) : null}
                  {showBlank ? (
                    <span className="sheet-tag">Left for you</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
        <div className="sheet-app-foot">
          <span className="sheet-submit">Submit application</span>
          <span className={fillDone ? "sheet-never is-on" : "sheet-never"}>
            Filler never clicks this. You do.
          </span>
        </div>
      </div>

      <p className="sheet-race-note">
        Replay of a recorded run on a test form; by hand at 40 words a minute.
        Real applications leave more for you:{" "}
        <a href="#handles">see where it works</a>.
      </p>
    </div>
  )
}
