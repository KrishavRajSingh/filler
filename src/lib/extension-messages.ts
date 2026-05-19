import type { UserProfile } from "./fill-schemas"

export const MESSAGE_RUN_FILL = "filler:run-fill"

export type RunFillMessage = {
  type: typeof MESSAGE_RUN_FILL
  profile: UserProfile
}

export type RunFillResponse =
  | {
      ok: true
      filled: number
      message: string
      skipped: number
    }
  | {
      ok: false
      message: string
    }
