import "~style.css"
import { Storage } from "@plasmohq/storage"
import { createProfileStore } from "~background/profile-store"
import { Layout } from "./Layout"
import { ProfileStoreContext } from "./use-profile"

const storage = new Storage({ area: "local" })
const profileStore = createProfileStore(storage)

function OptionsApp() {
  return (
    <ProfileStoreContext.Provider value={profileStore}>
      <Layout />
    </ProfileStoreContext.Provider>
  )
}

export default OptionsApp
