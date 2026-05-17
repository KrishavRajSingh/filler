import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import type { EducationEntry } from "~shared/schema"

export function Education() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Education">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell title="Education">
      <ArrayEditor<EducationEntry>
        items={profile.education}
        onChange={(next) => {
          void replace({ ...profile, education: next })
        }}
        newItem={() => ({ institution: "" })}
        addLabel="Add school"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <TextField
              label="Institution"
              value={item.institution}
              onChange={(e) => set({ institution: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Degree"
                value={item.degree ?? ""}
                onChange={(e) => set({ degree: e.target.value })}
              />
              <TextField
                label="Field of study"
                value={item.field ?? ""}
                onChange={(e) => set({ field: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TextField
                label="Start"
                type="date"
                value={item.start ?? ""}
                onChange={(e) => set({ start: e.target.value })}
              />
              <TextField
                label="End"
                type="date"
                value={item.end ?? ""}
                onChange={(e) => set({ end: e.target.value })}
              />
              <TextField
                label="GPA"
                type="number"
                step="0.01"
                value={item.gpa ?? ""}
                onChange={(e) =>
                  set({ gpa: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      />
    </SectionShell>
  )
}
