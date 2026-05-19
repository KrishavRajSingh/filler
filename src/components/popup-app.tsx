import { useEffect, useState } from "react"

import {
  MESSAGE_RUN_FILL,
  type RunFillResponse
} from "~lib/extension-messages"
import type { UserProfile } from "~lib/fill-schemas"
import {
  getStoredProfile,
  hasProfileContent,
  normalizeProfile
} from "~lib/profile-storage"

type FillStatus = "loading-profile" | "ready" | "filling" | "error"

export function PopupApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<FillStatus>("loading-profile")
  const [message, setMessage] = useState("")

  useEffect(() => {
    getStoredProfile()
      .then((storedProfile) => {
        setProfile(storedProfile)
        setStatus("ready")
      })
      .catch(() => {
        setStatus("error")
        setMessage("Could not load your local profile.")
      })
  }, [])

  function openProfileEditor() {
    chrome.runtime.openOptionsPage()
  }

  async function fillCurrentForm() {
    if (!profile || !hasProfileContent(profile)) {
      openProfileEditor()
      return
    }

    setStatus("filling")

    try {
      setMessage("Reading visible fields...")
      const response = await runFillInBackground(normalizeProfile(profile))

      setStatus(response.ok ? "ready" : "error")
      setMessage(response.message)
    } catch {
      setStatus("error")
      setMessage("Could not fill this form. Please try again.")
    }
  }

  const hasProfile = profile ? hasProfileContent(profile) : false

  return (
    <main
      style={{
        background: "#fffaf2",
        color: "#2c2118",
        fontFamily:
          'Avenir Next, "Gill Sans", "Trebuchet MS", ui-sans-serif, sans-serif',
        minWidth: 340,
        padding: 18
      }}>
      <p
        style={{
          color: "#9b7654",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.14em",
          margin: "0 0 6px",
          textTransform: "uppercase"
        }}>
        AI form filler
      </p>
      <h1 style={{ fontSize: 28, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
        Filler
      </h1>
      <p style={{ color: "#6b5d50", lineHeight: 1.5, margin: "0 0 16px" }}>
        {hasProfile
          ? "Ready to fill the visible form using your local profile."
          : "Create your local profile before filling forms."}
      </p>

      <div style={{ display: "grid", gap: 8 }}>
        <button
          disabled={status === "filling" || status === "loading-profile"}
          onClick={fillCurrentForm}
          style={primaryButtonStyle}>
          {hasProfile ? "Fill this form" : "Create profile"}
        </button>
        <button onClick={openProfileEditor} style={secondaryButtonStyle}>
          Edit profile
        </button>
      </div>

      {message ? (
        <p
          role="status"
          style={{
            background: status === "error" ? "#fff0ed" : "#f1eadf",
            border: "1px solid #eadfce",
            borderRadius: 12,
            color: status === "error" ? "#8a2f1f" : "#5f5145",
            fontSize: 13,
            lineHeight: 1.4,
            margin: "14px 0 0",
            padding: 10
          }}>
          {message}
        </p>
      ) : null}
    </main>
  )
}

function runFillInBackground(profile: UserProfile) {
  return new Promise<RunFillResponse>((resolve, reject) => {
    chrome.runtime.sendMessage({ profile, type: MESSAGE_RUN_FILL }, (response) => {
      const error = chrome.runtime.lastError
      if (error) {
        reject(new Error(error.message))
        return
      }

      resolve(
        response ?? {
          message: "Could not fill this form. Please try again.",
          ok: false
        }
      )
    })
  })
}

const primaryButtonStyle = {
  background: "#2c2118",
  border: "1px solid #2c2118",
  borderRadius: 999,
  color: "#fffaf2",
  cursor: "pointer",
  font: "inherit",
  fontWeight: 900,
  padding: "11px 14px"
} satisfies React.CSSProperties

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#fff",
  border: "1px solid #decfba",
  color: "#2c2118"
} satisfies React.CSSProperties
