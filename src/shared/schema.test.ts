import { describe, expect, it } from "vitest"
import { ProfileSchema, type Profile } from "./schema"

const validProfile: Profile = {
  schemaVersion: 1,
  identity: {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    location: {},
    links: {}
  },
  work: { history: [] },
  education: [],
  startup: {},
  savedAnswers: [],
  customFields: []
}

describe("ProfileSchema", () => {
  it("accepts a minimal valid profile", () => {
    const result = ProfileSchema.safeParse(validProfile)
    expect(result.success).toBe(true)
  })

  it("rejects a profile with the wrong schemaVersion", () => {
    const bad = { ...validProfile, schemaVersion: 99 }
    const result = ProfileSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("rejects a profile missing fullName", () => {
    const bad = {
      ...validProfile,
      identity: { ...validProfile.identity, fullName: undefined as unknown as string }
    }
    const result = ProfileSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("rejects an invalid email", () => {
    const bad = {
      ...validProfile,
      identity: { ...validProfile.identity, email: "not-an-email" }
    }
    const result = ProfileSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("accepts an empty email (user has not filled it yet)", () => {
    const ok = {
      ...validProfile,
      identity: { ...validProfile.identity, email: "" }
    }
    const result = ProfileSchema.safeParse(ok)
    expect(result.success).toBe(true)
  })

  it("accepts a fully populated profile", () => {
    const full: Profile = {
      schemaVersion: 1,
      identity: {
        fullName: "Ada Lovelace",
        preferredName: "Ada",
        email: "ada@example.com",
        phone: "+44 20 0000 0000",
        location: { city: "London", country: "UK", timezone: "Europe/London" },
        dateOfBirth: "1815-12-10",
        pronouns: "she/her",
        citizenship: "British",
        workAuth: "Citizen",
        links: {
          linkedin: "https://linkedin.com/in/ada",
          github: "https://github.com/ada",
          twitter: "https://x.com/ada",
          website: "https://ada.dev"
        }
      },
      work: {
        currentRole: "Engineer",
        currentCompany: "Analytical Engines Ltd",
        yearsExperience: 10,
        salaryExpectation: "negotiable",
        history: [
          {
            title: "Mathematician",
            company: "Babbage Lab",
            start: "1840-01-01",
            end: "1850-01-01",
            summary: "wrote the first algorithm"
          }
        ]
      },
      education: [
        { institution: "Self-taught", degree: "n/a", field: "mathematics" }
      ],
      startup: {
        name: "Filler",
        oneLiner: "Fill any form in one click.",
        website: "https://filler.example",
        stage: "mvp",
        coFounderCount: 1,
        teamSize: 2,
        industry: "developer tools",
        businessModel: "freemium",
        traction: "100 weekly active",
        funding: "bootstrapped",
        location: "SF"
      },
      savedAnswers: [
        { id: "a1", tags: ["why us"], question: "Why apply?", answer: "Because." }
      ],
      customFields: [{ key: "TIN", value: "XXX", aliases: ["tax id"] }]
    }
    const result = ProfileSchema.safeParse(full)
    expect(result.success).toBe(true)
  })
})
