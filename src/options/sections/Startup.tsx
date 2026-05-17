import { useEffect, useState } from "react"
import { TextField, TextArea } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { useProfile } from "../use-profile"
import type { Startup as StartupT } from "~shared/schema"

export function Startup() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<StartupT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.startup)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Startup">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field(key: keyof StartupT) {
    return {
      value: (draft![key] as string | number | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const v = e.target.value
        const numeric = key === "coFounderCount" || key === "teamSize"
        setDraft({
          ...draft!,
          [key]: numeric ? (v === "" ? undefined : Number(v)) : v
        })
      },
      onBlur: () => void update("startup", { [key]: draft![key] } as Partial<StartupT>)
    }
  }

  return (
    <SectionShell title="Startup" description="Leave blank if you're not a founder.">
      <TextField id="startupName" label="Startup name" {...field("name")} />
      <TextField id="oneLiner" label="One-line description" {...field("oneLiner")} />
      <TextField id="website" label="Website" {...field("website")} />
      <div className="grid grid-cols-3 gap-3">
        <TextField id="stage" label="Stage" placeholder="idea / mvp / scaling" {...field("stage")} />
        <TextField id="founded" label="Founded" type="date" {...field("foundedDate")} />
        <TextField id="loc" label="Location" {...field("location")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="cofs" label="Co-founders" type="number" min={0} {...field("coFounderCount")} />
        <TextField id="team" label="Team size" type="number" min={0} {...field("teamSize")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="industry" label="Industry" {...field("industry")} />
        <TextField id="biz" label="Business model" {...field("businessModel")} />
      </div>
      <TextArea id="traction" label="Traction" rows={2} {...field("traction")} />
      <TextArea id="funding" label="Funding" rows={2} {...field("funding")} />
    </SectionShell>
  )
}
