import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import type { CustomField } from "~shared/schema"

export function CustomFields() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Custom fields">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      title="Custom fields"
      description="Long-tail fields that aren't in the main schema (tax IDs, visa codes, etc).">
      <ArrayEditor<CustomField>
        items={profile.customFields}
        onChange={(next) => {
          void replace({ ...profile, customFields: next })
        }}
        newItem={() => ({ key: "", value: "", aliases: [] })}
        addLabel="Add field"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Key"
                value={item.key}
                onChange={(e) => set({ key: e.target.value })}
              />
              <TextField
                label="Value"
                value={item.value}
                onChange={(e) => set({ value: e.target.value })}
              />
            </div>
            <TextField
              label="Aliases (comma-separated)"
              value={item.aliases?.join(", ") ?? ""}
              onChange={(e) =>
                set({
                  aliases: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                })
              }
              hint="Helps the LLM match this field across different form wordings"
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
