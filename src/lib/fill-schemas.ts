import { z } from "zod"

export const profileFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string()
})

export const profileSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fields: z.array(profileFieldSchema)
})

export const userProfileSchema = z.object({
  sections: z.array(profileSectionSchema)
})

export const extractedFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string()
})

export const extractedFieldSchema = z.object({
  id: z.string().min(1),
  frameId: z.number().optional(),
  frameUrl: z.string().optional(),
  tagName: z.enum(["div", "input", "textarea", "select"]),
  controlKind: z
    .enum(["aria-checkbox-group", "aria-listbox", "aria-radio-group", "native"])
    .optional(),
  inputType: z.string().optional(),
  role: z.string().optional(),
  labelText: z.string().optional(),
  ariaLabel: z.string().optional(),
  placeholder: z.string().optional(),
  currentValue: z.string().optional(),
  options: z.array(extractedFieldOptionSchema).optional(),
  nearbyText: z.string().optional(),
  required: z.boolean().optional()
})

export const pageContextSchema = z.object({
  title: z.string(),
  url: z.string(),
  headings: z.array(z.string())
})

export const fillRequestSchema = z.object({
  profile: userProfileSchema,
  page: pageContextSchema,
  fields: z.array(extractedFieldSchema)
})

export const fillInstructionSchema = z.object({
  fieldId: z.string().min(1),
  action: z.enum(["setValue", "selectOption", "check", "skip"]),
  value: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
  reason: z.string().optional()
})

export const fillResponseSchema = z.object({
  fields: z.array(fillInstructionSchema)
})

export type ProfileField = z.infer<typeof profileFieldSchema>
export type ProfileSection = z.infer<typeof profileSectionSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type ExtractedField = z.infer<typeof extractedFieldSchema>
export type PageContext = z.infer<typeof pageContextSchema>
export type FillRequest = z.infer<typeof fillRequestSchema>
export type FillInstruction = z.infer<typeof fillInstructionSchema>
export type FillResponse = z.infer<typeof fillResponseSchema>
