import { useState, type ReactNode } from "react"
import { Identity } from "./sections/Identity"
import { Work } from "./sections/Work"
import { Education } from "./sections/Education"
import { Startup } from "./sections/Startup"
import { SavedAnswers } from "./sections/SavedAnswers"
import { CustomFields } from "./sections/CustomFields"
import { Settings } from "./sections/Settings"
import { TEST_PAGE_HTML } from "./test-page-html"

const SECTIONS = [
  { id: "identity", label: "Identity", render: () => <Identity /> },
  { id: "work", label: "Work", render: () => <Work /> },
  { id: "education", label: "Education", render: () => <Education /> },
  { id: "startup", label: "Startup", render: () => <Startup /> },
  { id: "savedAnswers", label: "Saved answers", render: () => <SavedAnswers /> },
  { id: "customFields", label: "Custom fields", render: () => <CustomFields /> },
  { id: "settings", label: "Settings", render: () => <Settings /> }
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

export function Layout() {
  const [active, setActive] = useState<SectionId>("identity")
  const current = SECTIONS.find((s) => s.id === active)!

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4">
        <h1 className="mb-4 text-lg font-semibold">Filler</h1>
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`block w-full rounded px-3 py-2 text-left text-sm ${
                active === s.id ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([TEST_PAGE_HTML], { type: "text/html" })
              const url = URL.createObjectURL(blob)
              window.open(url, "_blank")
            }}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-center text-xs hover:bg-gray-100">
            Test on a page
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{current.render() as ReactNode}</main>
    </div>
  )
}
