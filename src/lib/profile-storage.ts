import type { UserProfile } from "./fill-schemas"

export const PROFILE_STORAGE_KEY = "filler:user-profile"

const starterSections = [
  "Personal Info",
  "Career",
  "Startup",
  "Projects",
  "Custom"
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createStarterProfile(): UserProfile {
  return {
    sections: starterSections.map((title) => ({
      id: slugify(title),
      title,
      fields: []
    }))
  }
}

export function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    sections: profile.sections
      .map((section) => ({
        ...section,
        title: section.title.trim(),
        fields: section.fields
          .map((field) => ({
            ...field,
            label: field.label.trim(),
            value: field.value.trim()
          }))
          .filter((field) => field.label.length > 0 && field.value.length > 0)
      }))
      .filter(
        (section) => section.title.length > 0 && section.fields.length > 0
      )
  }
}

export function hasProfileContent(profile: UserProfile) {
  return profile.sections.some((section) =>
    section.fields.some(
      (field) => field.label.trim().length > 0 && field.value.trim().length > 0
    )
  )
}

export async function getStoredProfile() {
  const value = await getStoredValue(PROFILE_STORAGE_KEY)

  return isUserProfile(value) ? value : null
}

export async function saveStoredProfile(profile: UserProfile) {
  await setStoredValue(PROFILE_STORAGE_KEY, profile)
  return profile
}

async function getStoredValue(key: string) {
  if (hasChromeLocalStorage()) {
    return new Promise<unknown>((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(new Error(error.message))
          return
        }

        resolve(result[key])
      })
    })
  }

  const rawValue = globalThis.localStorage?.getItem(key)
  if (!rawValue) return undefined

  try {
    return JSON.parse(rawValue) as unknown
  } catch {
    return undefined
  }
}

async function setStoredValue(key: string, value: UserProfile) {
  if (hasChromeLocalStorage()) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(new Error(error.message))
          return
        }

        resolve()
      })
    })
    return
  }

  globalThis.localStorage?.setItem(key, JSON.stringify(value))
}

function hasChromeLocalStorage() {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local)
}

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object" || !("sections" in value)) {
    return false
  }

  const sections = (value as { sections: unknown }).sections
  if (!Array.isArray(sections)) return false

  return sections.every((section) => {
    if (!section || typeof section !== "object") return false

    const candidate = section as {
      fields?: unknown
      id?: unknown
      title?: unknown
    }

    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      Array.isArray(candidate.fields) &&
      candidate.fields.every((field) => {
        if (!field || typeof field !== "object") return false

        const fieldCandidate = field as {
          id?: unknown
          label?: unknown
          value?: unknown
        }

        return (
          typeof fieldCandidate.id === "string" &&
          typeof fieldCandidate.label === "string" &&
          typeof fieldCandidate.value === "string"
        )
      })
    )
  })
}
