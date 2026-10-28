import { useEffect, useRef, useState } from "react"

import { ProfileEditor } from "~components/profile-editor"
import { trackExtensionEvent } from "~lib/extension-analytics"
import type { UserProfile } from "~lib/fill-schemas"
import {
  createStarterProfile,
  getStoredProfile,
  saveStoredProfile
} from "~lib/profile-storage"

const FOUND_VIA = [
  ["youtube", "YouTube"],
  ["instagram", "Instagram"],
  ["google", "Google"],
  ["reddit", "Reddit"],
  ["store", "Chrome Web Store"],
  ["ai", "ChatGPT or another AI"],
  ["friend", "A friend"],
  ["other", "Somewhere else"]
] as const

// Asked once after install: one tap, only the answer is sent.
function FoundVia() {
  const [answered, setAnswered] = useState<boolean | null>(null)

  useEffect(() => {
    chrome.storage.local
      .get("foundVia")
      .then(({ foundVia }) => setAnswered(!!foundVia))
      .catch(() => setAnswered(true))
  }, [])

  if (answered !== false) return null

  return (
    <div style={{ margin: "8px 0 20px" }}>
      <p style={{ color: "#6b5d50", fontWeight: 800, margin: "0 0 8px" }}>
        Quick one: where did you find Filler?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FOUND_VIA.map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              trackExtensionEvent("found_via", { source: id })
              chrome.storage.local.set({ foundVia: id }).catch(() => undefined)
              setAnswered(true)
            }}
            style={{
              background: "#fffaf2",
              border: "1px solid #d9c7b0",
              borderRadius: 999,
              color: "#2c2118",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              padding: "6px 12px"
            }}
            type="button">
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function OptionsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState("Loading profile...")
  const saveQueueRef = useRef(Promise.resolve())

  useEffect(() => {
    getStoredProfile()
      .then((storedProfile) => {
        setProfile(storedProfile ?? createStarterProfile())
        setStatus("")
      })
      .catch(() => {
        setProfile(createStarterProfile())
        setStatus("Could not load saved profile. Started a fresh local profile.")
      })
  }, [])

  async function handleChange(nextProfile: UserProfile) {
    setProfile(nextProfile)
    setStatus("Saving...")

    const saveOperation = saveQueueRef.current.catch(() => undefined).then(async () => {
      await saveStoredProfile(nextProfile)
    })
    saveQueueRef.current = saveOperation

    try {
      await saveOperation
      setStatus("Saved locally")
    } catch {
      setStatus("Save failed. Reload the extension and try again.")
    }
  }

  if (!profile) {
    return <main style={{ padding: 24 }}>{status}</main>
  }

  return (
    <main
      style={{
        background:
          "radial-gradient(circle at top left, #fff4d8 0, transparent 34%), #f6efe4",
        color: "#2c2118",
        fontFamily:
          'Avenir Next, "Gill Sans", "Trebuchet MS", ui-sans-serif, sans-serif',
        minHeight: "100vh",
        padding: 32
      }}>
      <div style={{ margin: "0 auto", maxWidth: 1080 }}>
        <p
          style={{
            color: "#8a6b4f",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.14em",
            marginBottom: 8,
            textTransform: "uppercase"
          }}>
          Local profile
        </p>
        <h1 style={{ fontSize: 42, letterSpacing: "-0.04em", margin: 0 }}>
          Filler Profile
        </h1>
        <p style={{ color: "#6b5d50", lineHeight: 1.6, maxWidth: 720 }}>
          Your profile is stored locally on this browser. When you fill a form,
          your profile and visible form fields are sent to the AI API to generate
          answers.
        </p>
        <FoundVia />
        {status ? (
          <p
            role="status"
            style={{
              background: "#eaf7dc",
              border: "1px solid #cce5b5",
              borderRadius: 999,
              display: "inline-block",
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 16,
              padding: "7px 12px"
            }}>
            {status}
          </p>
        ) : null}
        <ProfileEditor onChange={handleChange} profile={profile} />
      </div>
    </main>
  )
}
