import "~style.css"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { createProfileStore } from "~background/profile-store"
import { defaultProfile, isProfileEmpty } from "~shared/default-profile"
import type { Profile } from "~shared/schema"

const storage = new Storage({ area: "local" })
const store = createProfileStore(storage)

function IndexPopup() {
  const [profile, setProfile] = useState<Profile>(defaultProfile())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    store.get().then((p) => {
      setProfile(p)
      setLoaded(true)
    })
  }, [])

  function openOptions() {
    chrome.runtime.openOptionsPage?.()
  }

  return (
    <div className="w-72 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-base font-semibold">Filler</h1>
        <button
          onClick={openOptions}
          className="text-xs text-gray-500 hover:underline"
          title="Open settings">
          settings
        </button>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : isProfileEmpty(profile) ? (
        <button
          onClick={openOptions}
          className="block w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
          Set up your profile (2 min) →
        </button>
      ) : (
        <div>
          <p className="text-sm text-gray-700">
            Profile ready for <span className="font-medium">{profile.identity.fullName}</span>.
          </p>
          <button
            disabled
            title="Coming in the next phase"
            className="mt-3 block w-full cursor-not-allowed rounded-md bg-gray-300 px-3 py-2 text-sm text-gray-700">
            ⚡ Fill this form (Plan C)
          </button>
          <button
            onClick={openOptions}
            className="mt-2 block w-full text-xs text-gray-500 hover:underline">
            Edit profile
          </button>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
