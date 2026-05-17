import { useEffect, useState } from "react"
import { TextField, TextArea } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { useProfile } from "../use-profile"
import type { Work as WorkT, WorkHistoryEntry } from "~shared/schema"

export function Work() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<WorkT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.work)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Work">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field(key: keyof WorkT) {
    return {
      value: (draft![key] as string | number | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({
          ...draft!,
          [key]: key === "yearsExperience" ? Number(e.target.value) : e.target.value
        }),
      onBlur: () => void update("work", { [key]: draft![key] } as Partial<WorkT>)
    }
  }

  return (
    <SectionShell title="Work">
      <div className="grid grid-cols-2 gap-3">
        <TextField id="currentRole" label="Current role" {...field("currentRole")} />
        <TextField id="currentCompany" label="Current company" {...field("currentCompany")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="yearsExperience"
          label="Years of experience"
          type="number"
          min={0}
          {...field("yearsExperience")}
        />
        <TextField
          id="salaryExpectation"
          label="Salary expectation"
          {...field("salaryExpectation")}
        />
      </div>

      <h2 className="pt-4 text-sm font-semibold text-gray-700">History</h2>
      <ArrayEditor<WorkHistoryEntry>
        items={draft.history}
        onChange={(next) => {
          setDraft({ ...draft, history: next })
          void update("work", { history: next })
        }}
        newItem={() => ({ title: "", company: "", start: "" })}
        addLabel="Add role"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Title"
                value={item.title}
                onChange={(e) => set({ title: e.target.value })}
              />
              <TextField
                label="Company"
                value={item.company}
                onChange={(e) => set({ company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Start"
                type="date"
                value={item.start}
                onChange={(e) => set({ start: e.target.value })}
              />
              <TextField
                label="End (leave empty if current)"
                type="date"
                value={item.end ?? ""}
                onChange={(e) => set({ end: e.target.value || undefined })}
              />
            </div>
            <TextArea
              label="Summary"
              rows={2}
              value={item.summary ?? ""}
              onChange={(e) => set({ summary: e.target.value })}
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
