import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField, TextArea } from "../components/Field"
import { useProfile } from "../use-profile"
import type { SavedAnswer } from "~shared/schema"

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function SavedAnswers() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Saved answers">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      title="Saved answers"
      description={'Your go-to answers for common questions ("why us", "coolest project", intro video URL, etc). The LLM picks the right one per form.'}>
      <ArrayEditor<SavedAnswer>
        items={profile.savedAnswers}
        onChange={(next) => {
          void replace({ ...profile, savedAnswers: next })
        }}
        newItem={() => ({ id: uuid(), tags: [], question: "", answer: "" })}
        addLabel="Add answer"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <TextField
              label="Tags (comma-separated)"
              value={item.tags.join(", ")}
              onChange={(e) =>
                set({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                })
              }
              hint="e.g. why us, coolest project, intro video"
            />
            <TextField
              label="Question"
              value={item.question}
              onChange={(e) => set({ question: e.target.value })}
            />
            <TextArea
              label="Answer"
              rows={4}
              value={item.answer}
              onChange={(e) => set({ answer: e.target.value })}
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
