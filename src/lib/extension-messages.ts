import type { ExtractedField, FillInstruction, PageContext } from "./fill-schemas"

export const MESSAGE_EXTRACT_FIELDS = "filler:extract-fields"
export const MESSAGE_APPLY_FILL = "filler:apply-fill"

export type ExtractFieldsMessage = {
  type: typeof MESSAGE_EXTRACT_FIELDS
  frameId?: number
}

export type ExtractFieldsResponse = {
  ok: true
  frameId?: number
  frameUrl?: string
  page: PageContext
  fields: ExtractedField[]
}

export type ApplyFillMessage = {
  type: typeof MESSAGE_APPLY_FILL
  instructions: FillInstruction[]
}

export type ApplyFillResponse = {
  ok: true
  filled: number
  skipped: number
}
