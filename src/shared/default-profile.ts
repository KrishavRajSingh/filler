import type { Profile } from "./schema"

export function defaultProfile(): Profile {
  return {
    schemaVersion: 1,
    identity: {
      fullName: "",
      email: "",
      location: {},
      links: {}
    },
    work: { history: [] },
    education: [],
    startup: {},
    savedAnswers: [],
    customFields: []
  }
}

export function isProfileEmpty(p: Profile): boolean {
  return p.identity.fullName.trim() === "" && p.identity.email.trim() === ""
}
