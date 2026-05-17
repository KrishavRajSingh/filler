import { Storage } from "@plasmohq/storage"
import { createProfileStore } from "./profile-store"

const storage = new Storage({ area: "local" })

export const profileStore = createProfileStore(storage)

console.log("[filler] background service worker booted")
