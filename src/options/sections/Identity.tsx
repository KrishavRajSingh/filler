import { useEffect, useState } from "react"
import { TextField } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { useProfile } from "../use-profile"
import type { Identity as IdentityT } from "~shared/schema"

export function Identity() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<IdentityT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.identity)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Identity">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field<K extends keyof IdentityT>(key: K) {
    return {
      value: (draft![key] as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, [key]: e.target.value }),
      onBlur: () => void update("identity", { [key]: draft![key] } as Partial<IdentityT>)
    }
  }

  function linkField(key: keyof IdentityT["links"]) {
    return {
      value: draft!.links[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, links: { ...draft!.links, [key]: e.target.value } }),
      onBlur: () =>
        void update("identity", { links: { ...draft!.links } } as Partial<IdentityT>)
    }
  }

  function locField(key: keyof IdentityT["location"]) {
    return {
      value: draft!.location[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, location: { ...draft!.location, [key]: e.target.value } }),
      onBlur: () =>
        void update("identity", { location: { ...draft!.location } } as Partial<IdentityT>)
    }
  }

  return (
    <SectionShell title="Identity" description="The basics. Autosaves as you type.">
      <TextField id="fullName" label="Full name" {...field("fullName")} />
      <TextField id="preferredName" label="Preferred name" {...field("preferredName")} />
      <TextField id="email" type="email" label="Email" {...field("email")} />
      <TextField id="phone" label="Phone" {...field("phone")} />

      <div className="grid grid-cols-3 gap-3">
        <TextField id="city" label="City" {...locField("city")} />
        <TextField id="country" label="Country" {...locField("country")} />
        <TextField id="timezone" label="Timezone" {...locField("timezone")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField id="dob" label="Date of birth" type="date" {...field("dateOfBirth")} />
        <TextField id="pronouns" label="Pronouns" {...field("pronouns")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="citizenship" label="Citizenship" {...field("citizenship")} />
        <TextField id="workAuth" label="Work authorization" {...field("workAuth")} />
      </div>

      <h2 className="pt-4 text-sm font-semibold text-gray-700">Links</h2>
      <TextField id="linkedin" label="LinkedIn" {...linkField("linkedin")} />
      <TextField id="github" label="GitHub" {...linkField("github")} />
      <TextField id="twitter" label="Twitter / X" {...linkField("twitter")} />
      <TextField id="website" label="Website / portfolio" {...linkField("website")} />
    </SectionShell>
  )
}
