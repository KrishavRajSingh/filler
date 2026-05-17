import { z } from "zod"

const emailField = z.string().refine(
  (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  { message: "Must be a valid email or empty" }
)

const LinksSchema = z.object({
  linkedin: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional()
})

const LocationSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional()
})

const IdentitySchema = z.object({
  fullName: z.string(),
  preferredName: z.string().optional(),
  email: emailField,
  phone: z.string().optional(),
  location: LocationSchema,
  dateOfBirth: z.string().optional(),
  pronouns: z.string().optional(),
  citizenship: z.string().optional(),
  workAuth: z.string().optional(),
  links: LinksSchema
})

const WorkHistoryEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  start: z.string(),
  end: z.string().optional(),
  summary: z.string().optional()
})

const WorkSchema = z.object({
  currentRole: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsExperience: z.number().nonnegative().optional(),
  salaryExpectation: z.string().optional(),
  history: z.array(WorkHistoryEntrySchema)
})

const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  gpa: z.number().optional()
})

const StartupSchema = z.object({
  name: z.string().optional(),
  oneLiner: z.string().optional(),
  website: z.string().optional(),
  stage: z.string().optional(),
  foundedDate: z.string().optional(),
  coFounderCount: z.number().nonnegative().optional(),
  teamSize: z.number().nonnegative().optional(),
  industry: z.string().optional(),
  businessModel: z.string().optional(),
  traction: z.string().optional(),
  funding: z.string().optional(),
  location: z.string().optional()
})

const SavedAnswerSchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  question: z.string(),
  answer: z.string()
})

const CustomFieldSchema = z.object({
  key: z.string(),
  value: z.string(),
  aliases: z.array(z.string()).optional()
})

export const ProfileSchema = z.object({
  schemaVersion: z.literal(1),
  identity: IdentitySchema,
  work: WorkSchema,
  education: z.array(EducationEntrySchema),
  startup: StartupSchema,
  savedAnswers: z.array(SavedAnswerSchema),
  customFields: z.array(CustomFieldSchema)
})

export type Profile = z.infer<typeof ProfileSchema>
export type Identity = Profile["identity"]
export type Work = Profile["work"]
export type WorkHistoryEntry = z.infer<typeof WorkHistoryEntrySchema>
export type EducationEntry = z.infer<typeof EducationEntrySchema>
export type Startup = Profile["startup"]
export type SavedAnswer = z.infer<typeof SavedAnswerSchema>
export type CustomField = z.infer<typeof CustomFieldSchema>
