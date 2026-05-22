import { useEffect, useRef, useState } from "react"
import { SectionShell } from "../components/SectionShell"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import { ProfileSchema } from "~shared/schema"
import { Storage } from "@plasmohq/storage"

const API_URL_KEY = "filler.apiBaseUrl"
const DEFAULT_API_URL = "https://filler.example/api"

export function Settings() {
  const { profile, replace, clearAll, loaded } = useProfile()
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(DEFAULT_API_URL)
  const importInput = useRef<HTMLInputElement>(null)
  const settings = new Storage({ area: "local" })

  useEffect(() => {
    void settings.get<string>(API_URL_KEY).then((v) => {
      if (v) setApiBaseUrl(v)
    })
  }, [])

  async function exportJson() {
    if (!profile) return
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `filler-profile-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      alert("That file isn't valid JSON.")
      return
    }
    const result = ProfileSchema.safeParse(parsed)
    if (!result.success) {
      alert("That JSON doesn't match the Filler profile schema.")
      return
    }
    await replace(result.data)
    alert("Profile imported.")
    if (importInput.current) importInput.current.value = ""
  }

  async function onClear() {
    if (!confirm("Erase your entire local profile? This cannot be undone.")) return
    await clearAll()
    alert("Profile cleared.")
  }

  async function saveApiBaseUrl() {
    await settings.set(API_URL_KEY, apiBaseUrl)
  }

  if (!loaded) {
    return (
      <SectionShell title="Settings">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell title="Settings">
      <div>
        <TextField
          id="apiBaseUrl"
          label="Filler API base URL"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
          onBlur={saveApiBaseUrl}
          hint="The hosted default works for everyone. Override if you self-host the Next.js side."
        />
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Backup</h2>
        <p className="mt-1 text-xs text-gray-500">
          Profile lives only in your browser. Export to a JSON file you keep yourself.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
            Export JSON
          </button>
          <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            Import JSON
            <input
              ref={importInput}
              type="file"
              accept="application/json"
              onChange={importJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Erase everything Filler has stored in this browser.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-100">
          Clear all data
        </button>
      </div>

      <div className="pt-4 text-xs text-gray-500">
        Filler · v0.0.3 · <a href="https://github.com/" className="underline">repo</a>
      </div>
    </SectionShell>
  )
}
