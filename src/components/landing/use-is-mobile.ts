import { useSyncExternalStore } from "react"

import { isLikelyMobileEnvironment } from "~lib/device"

function subscribe() {
  return () => {}
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    isLikelyMobileEnvironment,
    () => false
  )
}
