import { useEffect, useMemo, useState } from "react"

import type { UserProfile } from "~lib/fill-schemas"
import { createId, restoreStarterProfile } from "~lib/profile-storage"

type ProfileEditorProps = {
  profile: UserProfile
  onChange: (profile: UserProfile) => void
}

const shellStyle = {
  display: "grid",
  gap: 20,
  gridTemplateColumns: "240px minmax(0, 1fr)"
} satisfies React.CSSProperties

const panelStyle = {
  background: "#fffaf2",
  border: "1px solid #eadfce",
  borderRadius: 18,
  boxShadow: "0 18px 50px rgba(48, 36, 24, 0.08)"
} satisfies React.CSSProperties

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    profile.sections[0]?.id ?? ""
  )

  const selectedSection = useMemo(
    () =>
      profile.sections.find((section) => section.id === selectedSectionId) ??
      profile.sections[0],
    [profile.sections, selectedSectionId]
  )

  useEffect(() => {
    if (!selectedSection && profile.sections[0]) {
      setSelectedSectionId(profile.sections[0].id)
    }
  }, [profile.sections, selectedSection])

  function addSection() {
    const section = {
      id: createId("section"),
      title: "New Section",
      fields: []
    }

    setSelectedSectionId(section.id)
    onChange({ sections: [...profile.sections, section] })
  }

  function updateSectionTitle(title: string) {
    if (!selectedSection) return

    onChange({
      sections: profile.sections.map((section) =>
        section.id === selectedSection.id ? { ...section, title } : section
      )
    })
  }

  function removeSection(sectionId: string) {
    const nextSections = profile.sections.filter(
      (section) => section.id !== sectionId
    )

    setSelectedSectionId(nextSections[0]?.id ?? "")
    onChange({ sections: nextSections })
  }

  function restoreStarters() {
    const nextProfile = restoreStarterProfile(profile)

    setSelectedSectionId(nextProfile.sections[0]?.id ?? "")
    onChange(nextProfile)
  }

  function addField() {
    if (!selectedSection) return

    onChange({
      sections: profile.sections.map((section) =>
        section.id === selectedSection.id
          ? {
              ...section,
              fields: [
                ...section.fields,
                { id: createId("field"), label: "", value: "" }
              ]
            }
          : section
      )
    })
  }

  function updateField(fieldId: string, patch: { label?: string; value?: string }) {
    if (!selectedSection) return

    onChange({
      sections: profile.sections.map((section) =>
        section.id === selectedSection.id
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, ...patch } : field
              )
            }
          : section
      )
    })
  }

  function removeField(fieldId: string) {
    if (!selectedSection) return

    onChange({
      sections: profile.sections.map((section) =>
        section.id === selectedSection.id
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId)
            }
          : section
      )
    })
  }

  return (
    <div style={shellStyle}>
      <aside style={{ ...panelStyle, padding: 14 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Sections</h2>
          <button onClick={addSection} style={smallButtonStyle}>
            Add
          </button>
        </div>
        {profile.sections.length > 0 ? (
          <button
            onClick={restoreStarters}
            style={{ ...secondaryButtonStyle, marginTop: 10, width: "100%" }}>
            Restore starter sections
          </button>
        ) : null}

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {profile.sections.map((section) => {
            const isSelected = section.id === selectedSection?.id

            return (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                style={{
                  background: isSelected ? "#2c2118" : "#fff",
                  border: "1px solid #eadfce",
                  borderRadius: 12,
                  color: isSelected ? "#fffaf2" : "#2c2118",
                  cursor: "pointer",
                  fontWeight: 700,
                  padding: "10px 12px",
                  textAlign: "left"
                }}>
                {section.title || "Untitled section"}
              </button>
            )
          })}
        </div>
      </aside>

      <main style={{ ...panelStyle, padding: 20 }}>
        {selectedSection ? (
          <>
            <div
              style={{
                alignItems: "flex-end",
                display: "grid",
                gap: 12,
                gridTemplateColumns: "1fr auto"
              }}>
              <label style={labelStyle}>
                Section title
                <input
                  onChange={(event) => updateSectionTitle(event.target.value)}
                  style={inputStyle}
                  value={selectedSection.title}
                />
              </label>
              <button
                onClick={() => removeSection(selectedSection.id)}
                style={dangerButtonStyle}>
                Remove section
              </button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {selectedSection.fields.map((field) => (
                <div
                  key={field.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #eadfce",
                    borderRadius: 14,
                    display: "grid",
                    gap: 10,
                    padding: 14
                  }}>
                  <label style={labelStyle}>
                    Field label
                    <input
                      onChange={(event) =>
                        updateField(field.id, { label: event.target.value })
                      }
                      placeholder="Company name"
                      style={inputStyle}
                      value={field.label}
                    />
                  </label>
                  <label style={labelStyle}>
                    Field value
                    <textarea
                      onChange={(event) =>
                        updateField(field.id, { value: event.target.value })
                      }
                      placeholder="Acme AI"
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical" }}
                      value={field.value}
                    />
                  </label>
                  <button
                    onClick={() => removeField(field.id)}
                    style={{ ...dangerButtonStyle, justifySelf: "start" }}>
                    Remove field
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addField} style={{ ...primaryButtonStyle, marginTop: 14 }}>
              Add field
            </button>
          </>
        ) : (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p>No sections yet. Restore the starter profile keys or create a custom section.</p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 14
              }}>
              <button onClick={restoreStarters} style={primaryButtonStyle}>
                Restore starter sections
              </button>
              <button onClick={addSection} style={secondaryButtonStyle}>
                Create custom section
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const labelStyle = {
  color: "#5f5145",
  display: "grid",
  fontSize: 12,
  fontWeight: 800,
  gap: 6,
  letterSpacing: "0.04em",
  textTransform: "uppercase"
} satisfies React.CSSProperties

const inputStyle = {
  background: "#fffdf9",
  border: "1px solid #decfba",
  borderRadius: 12,
  color: "#2c2118",
  font: "inherit",
  fontSize: 14,
  padding: "11px 12px"
} satisfies React.CSSProperties

const primaryButtonStyle = {
  background: "#2c2118",
  border: "1px solid #2c2118",
  borderRadius: 999,
  color: "#fffaf2",
  cursor: "pointer",
  fontWeight: 800,
  padding: "10px 14px"
} satisfies React.CSSProperties

const smallButtonStyle = {
  ...primaryButtonStyle,
  fontSize: 12,
  marginLeft: "auto",
  padding: "6px 10px"
} satisfies React.CSSProperties

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#fff",
  border: "1px solid #decfba",
  color: "#2c2118"
} satisfies React.CSSProperties

const dangerButtonStyle = {
  background: "#fff",
  border: "1px solid #e0b4a9",
  borderRadius: 999,
  color: "#8a2f1f",
  cursor: "pointer",
  fontWeight: 800,
  padding: "10px 14px"
} satisfies React.CSSProperties
