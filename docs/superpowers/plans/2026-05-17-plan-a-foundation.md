# Filler Plan A — Foundation (Profile + Options Page) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an installable Chrome extension that lets the user build and persist their full Filler profile, with no form-filling capability yet (that comes in Plans B and C).

**Architecture:** Plasmo MV3 extension with a Tailwind options page acting as a sectioned profile editor, persisting to `chrome.storage.local` via `@plasmohq/storage`. A zod schema in `src/shared/schema.ts` is the single source of truth for the profile shape and will be reused by the backend and content script in later plans. The popup is a minimal stub showing setup status.

**Tech Stack:** TypeScript, React 18, Plasmo 0.90, `@plasmohq/storage`, Tailwind CSS, zod, Vitest + happy-dom + Testing Library, pnpm.

**Spec:** `docs/superpowers/specs/2026-05-17-filler-design.md`

---

## File structure produced by this plan

```
filler/
├── .env.example                              # NEW
├── package.json                              # MODIFIED (deps, scripts, manifest)
├── tailwind.config.ts                        # NEW
├── postcss.config.cjs                        # NEW
├── vitest.config.ts                          # NEW
├── tests/
│   └── setup.ts                              # NEW (Testing Library + happy-dom)
├── src/
│   ├── style.css                             # NEW (Tailwind directives)
│   ├── shared/
│   │   ├── schema.ts                         # NEW (zod Profile)
│   │   ├── schema.test.ts                    # NEW
│   │   ├── default-profile.ts                # NEW
│   │   └── default-profile.test.ts           # NEW
│   ├── background/
│   │   ├── index.ts                          # NEW (service worker entry)
│   │   ├── profile-store.ts                  # NEW
│   │   └── profile-store.test.ts             # NEW
│   ├── options/
│   │   ├── index.tsx                         # NEW (Plasmo options entry)
│   │   ├── Layout.tsx                        # NEW (left rail + content)
│   │   ├── use-profile.ts                    # NEW (React hook over ProfileStore)
│   │   ├── use-profile.test.tsx              # NEW
│   │   ├── components/
│   │   │   ├── Field.tsx                     # NEW (label + input wrapper)
│   │   │   ├── ArrayEditor.tsx               # NEW (add/remove row helper)
│   │   │   └── SectionShell.tsx              # NEW (section card)
│   │   ├── sections/
│   │   │   ├── Identity.tsx                  # NEW
│   │   │   ├── Identity.test.tsx             # NEW
│   │   │   ├── Work.tsx                      # NEW
│   │   │   ├── Education.tsx                 # NEW
│   │   │   ├── Startup.tsx                   # NEW
│   │   │   ├── SavedAnswers.tsx              # NEW
│   │   │   ├── CustomFields.tsx              # NEW
│   │   │   └── Settings.tsx                  # NEW
│   │   └── test-page.html                    # NEW (synthetic form for dogfooding)
│   ├── popup/
│   │   └── index.tsx                         # MODIFIED (setup-status popup)
│   └── components/
│       └── main.tsx                          # UNCHANGED (Plasmo demo, leave alone)
└── docs/superpowers/plans/
    └── 2026-05-17-plan-a-foundation.md       # this file
```

### Files removed by this plan

- `src/pages/index.tsx` — leftover Plasmo scaffold pointing at the same `Main` demo. Replaced by the marketing landing in Plan B; leaving it in would confuse routing. **Deleted in Task 3.**

### Files left intentionally untouched

- `src/components/main.tsx` — Plasmo's demo component. Not imported by anything we add. Removed in Plan C when we delete the demo wiring entirely.

---

## Conventions for this plan

- **Package manager:** `pnpm` everywhere. Never `npm`. The repo has `pnpm-lock.yaml`.
- **Imports:** the `~` alias maps to `./src/` (see `tsconfig.json`). Use it.
- **Tests next to source:** `foo.ts` lives next to `foo.test.ts`. Vitest config below scopes test discovery to `src/**/*.test.{ts,tsx}` and `tests/**/*.test.{ts,tsx}`.
- **No barrel files** (`index.ts` re-exports). Import directly from source modules. Plasmo's bundler treats `src/options/index.tsx` etc. as entry points — those exist for Plasmo, not for re-exports.
- **Autosave:** sections persist on blur via `onBlur` writing the section back through `useProfile.update(section, patch)`. No save button anywhere.

---

## Task 0: Security hygiene + .env.example

**Files:**
- Create: `.env.example`
- Verify: `.gitignore` already ignores `.env*` (it does)
- Verify: `git ls-files | grep ^.env` returns empty (no `.env` is tracked)

**Why:** Spec Section 12 calls out a security follow-up. `.env` is not committed (confirmed) so this is purely about preventing future accidents and documenting the env shape.

- [ ] **Step 0.1: Verify `.env` is not tracked**

Run: `git ls-files | grep -E "^\.env" || echo NOT_TRACKED`
Expected output: `NOT_TRACKED`
If anything else appears: stop and tell the user the key is in git history; do not continue this task.

- [ ] **Step 0.2: Create `.env.example`**

Create `.env.example` with this exact content:

```
# Filler — environment variables.
# Copy this file to .env and fill in real values for local dev.
# .env is git-ignored and never shipped with the extension build.

# OpenAI API key used by the Next.js /api/fill route (Plan B).
# Get one at https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Optional: override the default model (gpt-4o-mini).
# FILLER_MODEL=gpt-4o-mini
```

- [ ] **Step 0.3: Commit**

```bash
git add .env.example
git commit -m "chore: add .env.example template"
```

- [ ] **Step 0.4: Remind the user (do not auto-run)**

Output the following message to the user verbatim and do NOT execute anything:

> The OpenAI key in your local `.env` was visible in our chat earlier. It's not in git, but for defense-in-depth please rotate it at https://platform.openai.com/api-keys before Plan B ships.

---

## Task 1: Install dependencies and tooling

**Files:**
- Modify: `package.json` (deps + scripts)

- [ ] **Step 1.1: Install runtime dependencies**

Run:
```bash
pnpm add zod
```
Expected: `package.json` `dependencies` gains `zod`. (Use whatever version pnpm resolves to. Do not pin manually.)

- [ ] **Step 1.2: Install styling dependencies**

Run:
```bash
pnpm add -D tailwindcss postcss autoprefixer prettier-plugin-tailwindcss
```
Expected: `package.json` `devDependencies` gains all four.

- [ ] **Step 1.3: Install test dependencies**

Run:
```bash
pnpm add -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```
Expected: `package.json` `devDependencies` gains all six.

- [ ] **Step 1.4: Add test scripts**

In `package.json`, replace the `"scripts"` block with:

```json
  "scripts": {
    "start": "next start",
    "dev": "run-p dev:*",
    "dev:plasmo": "plasmo dev",
    "dev:next": "next dev --port 1947",
    "build": "run-p build:*",
    "build:plasmo": "plasmo build",
    "build:next": "next build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
```

- [ ] **Step 1.5: Verify install**

Run: `pnpm install`
Expected: no errors, lockfile updated.

- [ ] **Step 1.6: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add zod, tailwind, vitest, testing-library deps"
```

---

## Task 2: Tailwind + PostCSS config and global stylesheet

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.cjs`
- Create: `src/style.css`

- [ ] **Step 2.1: Create `tailwind.config.ts`**

Create with this exact content:

```ts
import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        filler: {
          green: "#22c55e",
          amber: "#f59e0b",
          grey: "#9ca3af"
        }
      }
    }
  },
  plugins: []
} satisfies Config
```

- [ ] **Step 2.2: Create `postcss.config.cjs`**

Create with this exact content:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Step 2.3: Create `src/style.css`**

Create with this exact content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  @apply m-0 p-0 bg-white text-gray-900 antialiased;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

- [ ] **Step 2.4: Commit**

```bash
git add tailwind.config.ts postcss.config.cjs src/style.css
git commit -m "chore: add tailwind + postcss config and global stylesheet"
```

---

## Task 3: Vitest config + test setup + remove dead Next.js page

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Delete: `src/pages/index.tsx` (leftover Plasmo scaffold)

- [ ] **Step 3.1: Create `vitest.config.ts`**

Create with this exact content:

```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  }
})
```

- [ ] **Step 3.2: Create `tests/setup.ts`**

Create with this exact content:

```ts
import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
```

- [ ] **Step 3.3: Delete the dead Next.js page**

Run: `git rm src/pages/index.tsx`
Expected: file removed.
Reason: it imports the same Plasmo demo `<Main />` used by the popup; keeping it here would muddle Plan B's marketing landing.

- [ ] **Step 3.4: Sanity-check vitest discovers no tests yet**

Run: `pnpm test`
Expected: vitest exits with "No test files found" (exit code 1, that's fine — we have no tests yet). If it errors out with a config problem, fix the config.

- [ ] **Step 3.5: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git rm src/pages/index.tsx
git commit -m "chore: add vitest config and remove dead Next.js scaffold page"
```

---

## Task 4: Profile zod schema

**Files:**
- Create: `src/shared/schema.ts`
- Create: `src/shared/schema.test.ts`

This is the single source of truth for the profile shape. Plans B and C will import the same types from here.

- [ ] **Step 4.1: Write the failing test**

Create `src/shared/schema.test.ts` with this exact content:

```ts
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
```

- [ ] **Step 4.2: Run the test, confirm it fails**

Run: `pnpm test src/shared/schema.test.ts`
Expected: FAIL — module `./schema` does not exist.

- [ ] **Step 4.3: Implement the schema**

Create `src/shared/schema.ts` with this exact content:

```ts
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
```

- [ ] **Step 4.4: Run the test, confirm it passes**

Run: `pnpm test src/shared/schema.test.ts`
Expected: all 6 tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/shared/schema.ts src/shared/schema.test.ts
git commit -m "feat(schema): add zod Profile schema and types"
```

---

## Task 5: Default profile

**Files:**
- Create: `src/shared/default-profile.ts`
- Create: `src/shared/default-profile.test.ts`

- [ ] **Step 5.1: Write the failing test**

Create `src/shared/default-profile.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { ProfileSchema } from "./schema"
import { defaultProfile, isProfileEmpty } from "./default-profile"

describe("defaultProfile", () => {
  it("validates against ProfileSchema", () => {
    const result = ProfileSchema.safeParse(defaultProfile())
    expect(result.success).toBe(true)
  })

  it("has empty identity fields", () => {
    const p = defaultProfile()
    expect(p.identity.fullName).toBe("")
    expect(p.identity.email).toBe("")
  })

  it("returns a fresh object each call (no shared references)", () => {
    const a = defaultProfile()
    const b = defaultProfile()
    a.identity.fullName = "Ada"
    expect(b.identity.fullName).toBe("")
    a.work.history.push({ title: "x", company: "y", start: "2020-01-01" })
    expect(b.work.history).toHaveLength(0)
  })
})

describe("isProfileEmpty", () => {
  it("returns true for a default profile", () => {
    expect(isProfileEmpty(defaultProfile())).toBe(true)
  })

  it("returns false once fullName is set", () => {
    const p = defaultProfile()
    p.identity.fullName = "Ada"
    expect(isProfileEmpty(p)).toBe(false)
  })

  it("returns false once an email is set", () => {
    const p = defaultProfile()
    p.identity.email = "ada@example.com"
    expect(isProfileEmpty(p)).toBe(false)
  })
})
```

- [ ] **Step 5.2: Run test, confirm it fails**

Run: `pnpm test src/shared/default-profile.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5.3: Implement**

Create `src/shared/default-profile.ts`:

```ts
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
```

- [ ] **Step 5.4: Run test, confirm it passes**

Run: `pnpm test src/shared/default-profile.test.ts`
Expected: all 5 tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/shared/default-profile.ts src/shared/default-profile.test.ts
git commit -m "feat(schema): add defaultProfile() and isProfileEmpty()"
```

---

## Task 6: ProfileStore wrapper around chrome.storage.local

**Files:**
- Create: `src/background/profile-store.ts`
- Create: `src/background/profile-store.test.ts`

`@plasmohq/storage` returns `Storage` from its constructor; tests inject an in-memory fake instead so we don't depend on a real browser.

- [ ] **Step 6.1: Write the failing test**

Create `src/background/profile-store.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest"
import { createProfileStore, PROFILE_KEY } from "./profile-store"
import { defaultProfile } from "~shared/default-profile"

function makeFakeStorage() {
  const data = new Map<string, unknown>()
  return {
    get: vi.fn(async (k: string) => data.get(k)),
    set: vi.fn(async (k: string, v: unknown) => {
      data.set(k, v)
    }),
    remove: vi.fn(async (k: string) => {
      data.delete(k)
    }),
    watch: vi.fn(),
    _data: data
  }
}

describe("createProfileStore", () => {
  it("returns defaultProfile when nothing is stored", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    const p = await store.get()
    expect(p).toEqual(defaultProfile())
  })

  it("persists what was set and returns it on next get", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    const next = defaultProfile()
    next.identity.fullName = "Ada"
    await store.set(next)
    const round = await store.get()
    expect(round.identity.fullName).toBe("Ada")
  })

  it("returns defaultProfile if stored data fails schema validation", async () => {
    const fake = makeFakeStorage()
    fake._data.set(PROFILE_KEY, { totally: "wrong" })
    const store = createProfileStore(fake as never)
    const p = await store.get()
    expect(p).toEqual(defaultProfile())
  })

  it("clear() removes the stored profile", async () => {
    const fake = makeFakeStorage()
    const store = createProfileStore(fake as never)
    const next = defaultProfile()
    next.identity.fullName = "Ada"
    await store.set(next)
    await store.clear()
    expect(fake.remove).toHaveBeenCalledWith(PROFILE_KEY)
  })

  it("update() shallow-merges into a top-level section", async () => {
    const store = createProfileStore(makeFakeStorage() as never)
    await store.update("identity", { fullName: "Ada", email: "ada@example.com" })
    const p = await store.get()
    expect(p.identity.fullName).toBe("Ada")
    expect(p.identity.email).toBe("ada@example.com")
    expect(p.identity.location).toEqual({}) // untouched
  })
})
```

- [ ] **Step 6.2: Run test, confirm it fails**

Run: `pnpm test src/background/profile-store.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 6.3: Implement**

Create `src/background/profile-store.ts`:

```ts
import type { Storage } from "@plasmohq/storage"
import { ProfileSchema, type Profile } from "~shared/schema"
import { defaultProfile } from "~shared/default-profile"

export const PROFILE_KEY = "filler.profile.v1"

export type ProfileStore = {
  get: () => Promise<Profile>
  set: (p: Profile) => Promise<void>
  clear: () => Promise<void>
  update: <K extends keyof Profile>(section: K, patch: Partial<Profile[K]>) => Promise<Profile>
}

export function createProfileStore(storage: Storage): ProfileStore {
  async function get(): Promise<Profile> {
    const raw = await storage.get(PROFILE_KEY)
    if (raw === undefined || raw === null) return defaultProfile()
    const parsed = ProfileSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn("[filler] stored profile failed schema validation, resetting")
      return defaultProfile()
    }
    return parsed.data
  }

  async function set(p: Profile): Promise<void> {
    const parsed = ProfileSchema.parse(p)
    await storage.set(PROFILE_KEY, parsed)
  }

  async function clear(): Promise<void> {
    await storage.remove(PROFILE_KEY)
  }

  async function update<K extends keyof Profile>(
    section: K,
    patch: Partial<Profile[K]>
  ): Promise<Profile> {
    const current = await get()
    const next = {
      ...current,
      [section]: { ...(current[section] as object), ...(patch as object) }
    } as Profile
    await set(next)
    return next
  }

  return { get, set, clear, update }
}
```

- [ ] **Step 6.4: Run test, confirm it passes**

Run: `pnpm test src/background/profile-store.test.ts`
Expected: all 5 tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/background/profile-store.ts src/background/profile-store.test.ts
git commit -m "feat(background): ProfileStore over @plasmohq/storage"
```

---

## Task 7: Background service worker entry

**Files:**
- Create: `src/background/index.ts`

The service worker is registered by Plasmo when a `background/index.ts` exists. It instantiates the real ProfileStore for the extension runtime.

- [ ] **Step 7.1: Create the entry**

Create `src/background/index.ts`:

```ts
import { Storage } from "@plasmohq/storage"
import { createProfileStore } from "./profile-store"

const storage = new Storage({ area: "local" })

export const profileStore = createProfileStore(storage)

// Heartbeat log so the worker is observable in chrome://extensions service worker devtools.
console.log("[filler] background service worker booted")
```

- [ ] **Step 7.2: Sanity-check the dev server boots**

Run: `pnpm dev:plasmo`
Wait until the console prints `🟢 INFO ... ready in ...ms` (typically <5s).
Stop with `Ctrl+C`. We will verify in the browser in Task 16.

- [ ] **Step 7.3: Commit**

```bash
git add src/background/index.ts
git commit -m "feat(background): register service worker with ProfileStore"
```

---

## Task 8: useProfile React hook

**Files:**
- Create: `src/options/use-profile.ts`
- Create: `src/options/use-profile.test.tsx`

The hook bridges React state and the ProfileStore. Tests use a fake store with the same interface.

- [ ] **Step 8.1: Write the failing test**

Create `src/options/use-profile.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useProfile, ProfileStoreContext } from "./use-profile"
import type { ProfileStore } from "~background/profile-store"
import { defaultProfile } from "~shared/default-profile"
import type { Profile } from "~shared/schema"
import { type ReactNode } from "react"

function makeFakeStore(initial: Profile = defaultProfile()): ProfileStore {
  let state = initial
  return {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Profile) => {
      state = p
    }),
    clear: vi.fn(async () => {
      state = defaultProfile()
    }),
    update: vi.fn(async (section, patch) => {
      state = {
        ...state,
        [section]: { ...(state[section] as object), ...(patch as object) }
      } as Profile
      return state
    })
  }
}

function wrapWith(store: ProfileStore) {
  return ({ children }: { children: ReactNode }) => (
    <ProfileStoreContext.Provider value={store}>
      {children}
    </ProfileStoreContext.Provider>
  )
}

describe("useProfile", () => {
  it("loads the default profile on mount", async () => {
    const store = makeFakeStore()
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.loaded).toBe(true))
    expect(result.current.profile?.identity.fullName).toBe("")
  })

  it("update() mutates the profile section and persists", async () => {
    const store = makeFakeStore()
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => {
      await result.current.update("identity", { fullName: "Ada" })
    })
    expect(result.current.profile?.identity.fullName).toBe("Ada")
    expect(store.update).toHaveBeenCalledWith("identity", { fullName: "Ada" })
  })

  it("clearAll() resets profile to default", async () => {
    const initial = defaultProfile()
    initial.identity.fullName = "Ada"
    const store = makeFakeStore(initial)
    const { result } = renderHook(() => useProfile(), { wrapper: wrapWith(store) })
    await waitFor(() => expect(result.current.profile?.identity.fullName).toBe("Ada"))
    await act(async () => {
      await result.current.clearAll()
    })
    expect(result.current.profile?.identity.fullName).toBe("")
  })
})
```

- [ ] **Step 8.2: Run test, confirm it fails**

Run: `pnpm test src/options/use-profile.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 8.3: Implement**

Create `src/options/use-profile.ts`:

```ts
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ProfileStore } from "~background/profile-store"
import type { Profile } from "~shared/schema"

export const ProfileStoreContext = createContext<ProfileStore | null>(null)

export type UseProfileResult = {
  loaded: boolean
  profile: Profile | null
  update: <K extends keyof Profile>(section: K, patch: Partial<Profile[K]>) => Promise<void>
  clearAll: () => Promise<void>
  replace: (p: Profile) => Promise<void>
}

export function useProfile(): UseProfileResult {
  const store = useContext(ProfileStoreContext)
  if (!store) throw new Error("useProfile must be inside ProfileStoreContext.Provider")

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    store.get().then((p) => {
      if (!cancelled) {
        setProfile(p)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [store])

  const update = useCallback<UseProfileResult["update"]>(
    async (section, patch) => {
      const next = await store.update(section, patch)
      setProfile(next)
    },
    [store]
  )

  const clearAll = useCallback<UseProfileResult["clearAll"]>(async () => {
    await store.clear()
    const fresh = await store.get()
    setProfile(fresh)
  }, [store])

  const replace = useCallback<UseProfileResult["replace"]>(
    async (p) => {
      await store.set(p)
      setProfile(p)
    },
    [store]
  )

  return { loaded, profile, update, clearAll, replace }
}
```

- [ ] **Step 8.4: Run test, confirm it passes**

Run: `pnpm test src/options/use-profile.test.tsx`
Expected: all 3 tests pass.

- [ ] **Step 8.5: Commit**

```bash
git add src/options/use-profile.ts src/options/use-profile.test.tsx
git commit -m "feat(options): useProfile hook + ProfileStoreContext"
```

---

## Task 9: Reusable form primitives (Field, SectionShell, ArrayEditor)

**Files:**
- Create: `src/options/components/Field.tsx`
- Create: `src/options/components/SectionShell.tsx`
- Create: `src/options/components/ArrayEditor.tsx`

These are lightly tested via render-presence so we don't re-write the same boilerplate for every section.

- [ ] **Step 9.1: Create `Field.tsx`**

```tsx
import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react"

type Common = {
  label: string
  hint?: string
}

export function TextField({
  label,
  hint,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <input
        {...rest}
        className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 ${rest.className ?? ""}`}
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

export function TextArea({
  label,
  hint,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <textarea
        {...rest}
        className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 ${rest.className ?? ""}`}
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  )
}
```

- [ ] **Step 9.2: Create `SectionShell.tsx`**

```tsx
import type { ReactNode } from "react"

export function SectionShell({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
```

- [ ] **Step 9.3: Create `ArrayEditor.tsx`**

```tsx
import { type ReactNode } from "react"

export function ArrayEditor<T>({
  items,
  onChange,
  newItem,
  renderRow,
  addLabel = "Add"
}: {
  items: T[]
  onChange: (next: T[]) => void
  newItem: () => T
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode
  addLabel?: string
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {renderRow(item, i, (patch) => {
            const next = [...items]
            next[i] = { ...item, ...patch }
            onChange(next)
          })}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-3 text-xs text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
        + {addLabel}
      </button>
    </div>
  )
}
```

- [ ] **Step 9.4: Commit**

```bash
git add src/options/components/
git commit -m "feat(options): add Field, SectionShell, ArrayEditor primitives"
```

---

## Task 10: Identity section + behaviour test

**Files:**
- Create: `src/options/sections/Identity.tsx`
- Create: `src/options/sections/Identity.test.tsx`

This is the most thoroughly tested section because it doubles as the template for the others.

- [ ] **Step 10.1: Write the failing test**

Create `src/options/sections/Identity.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Identity } from "./Identity"
import { ProfileStoreContext } from "../use-profile"
import { defaultProfile } from "~shared/default-profile"
import type { ProfileStore } from "~background/profile-store"
import type { Profile } from "~shared/schema"

function makeFakeStore(initial: Profile = defaultProfile()): ProfileStore {
  let state = initial
  return {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Profile) => {
      state = p
    }),
    clear: vi.fn(async () => {
      state = defaultProfile()
    }),
    update: vi.fn(async (section, patch) => {
      state = {
        ...state,
        [section]: { ...(state[section] as object), ...(patch as object) }
      } as Profile
      return state
    })
  }
}

function renderWithStore(store: ProfileStore) {
  return render(
    <ProfileStoreContext.Provider value={store}>
      <Identity />
    </ProfileStoreContext.Provider>
  )
}

describe("Identity section", () => {
  it("renders all primary identity inputs", async () => {
    renderWithStore(makeFakeStore())
    expect(await screen.findByLabelText(/Full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/GitHub/i)).toBeInTheDocument()
  })

  it("autosaves the full name on blur", async () => {
    const store = makeFakeStore()
    renderWithStore(store)
    const input = await screen.findByLabelText(/Full name/i)
    await userEvent.type(input, "Ada Lovelace")
    await userEvent.tab() // blur
    expect(store.update).toHaveBeenCalledWith(
      "identity",
      expect.objectContaining({ fullName: "Ada Lovelace" })
    )
  })

  it("autosaves a nested link (linkedin) on blur", async () => {
    const store = makeFakeStore()
    renderWithStore(store)
    const li = await screen.findByLabelText(/LinkedIn/i)
    await userEvent.type(li, "https://linkedin.com/in/ada")
    await userEvent.tab()
    // Implementation merges the whole links object; assert that's how it shipped.
    const calls = (store.update as ReturnType<typeof vi.fn>).mock.calls
    const last = calls[calls.length - 1]
    expect(last[0]).toBe("identity")
    expect(last[1].links).toMatchObject({ linkedin: "https://linkedin.com/in/ada" })
  })
})
```

- [ ] **Step 10.2: Run test, confirm it fails**

Run: `pnpm test src/options/sections/Identity.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 10.3: Implement**

Create `src/options/sections/Identity.tsx`:

```tsx
import { useEffect, useState } from "react"
import { TextField } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { useProfile } from "../use-profile"
import type { Identity as IdentityT } from "~shared/schema"

export function Identity() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<IdentityT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.identity)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Identity">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field<K extends keyof IdentityT>(key: K) {
    return {
      value: (draft![key] as string) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, [key]: e.target.value }),
      onBlur: () => void update("identity", { [key]: draft![key] } as Partial<IdentityT>)
    }
  }

  function linkField(key: keyof IdentityT["links"]) {
    return {
      value: draft!.links[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, links: { ...draft!.links, [key]: e.target.value } }),
      onBlur: () =>
        void update("identity", { links: { ...draft!.links } } as Partial<IdentityT>)
    }
  }

  function locField(key: keyof IdentityT["location"]) {
    return {
      value: draft!.location[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({ ...draft!, location: { ...draft!.location, [key]: e.target.value } }),
      onBlur: () =>
        void update("identity", { location: { ...draft!.location } } as Partial<IdentityT>)
    }
  }

  return (
    <SectionShell title="Identity" description="The basics. Autosaves as you type.">
      <TextField id="fullName" label="Full name" {...field("fullName")} />
      <TextField id="preferredName" label="Preferred name" {...field("preferredName")} />
      <TextField id="email" type="email" label="Email" {...field("email")} />
      <TextField id="phone" label="Phone" {...field("phone")} />

      <div className="grid grid-cols-3 gap-3">
        <TextField id="city" label="City" {...locField("city")} />
        <TextField id="country" label="Country" {...locField("country")} />
        <TextField id="timezone" label="Timezone" {...locField("timezone")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField id="dob" label="Date of birth" type="date" {...field("dateOfBirth")} />
        <TextField id="pronouns" label="Pronouns" {...field("pronouns")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="citizenship" label="Citizenship" {...field("citizenship")} />
        <TextField id="workAuth" label="Work authorization" {...field("workAuth")} />
      </div>

      <h2 className="pt-4 text-sm font-semibold text-gray-700">Links</h2>
      <TextField id="linkedin" label="LinkedIn" {...linkField("linkedin")} />
      <TextField id="github" label="GitHub" {...linkField("github")} />
      <TextField id="twitter" label="Twitter / X" {...linkField("twitter")} />
      <TextField id="website" label="Website / portfolio" {...linkField("website")} />
    </SectionShell>
  )
}
```

- [ ] **Step 10.4: Run test, confirm it passes**

Run: `pnpm test src/options/sections/Identity.test.tsx`
Expected: all 3 tests pass.

- [ ] **Step 10.5: Commit**

```bash
git add src/options/sections/Identity.tsx src/options/sections/Identity.test.tsx
git commit -m "feat(options): Identity section with autosave-on-blur"
```

---

## Task 11: Work section

**Files:**
- Create: `src/options/sections/Work.tsx`

We don't re-test the autosave pattern; Identity covers it. We do smoke-test by adding a render assertion at the end of Task 16.

- [ ] **Step 11.1: Create the file**

```tsx
import { useEffect, useState } from "react"
import { TextField, TextArea } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { useProfile } from "../use-profile"
import type { Work as WorkT, WorkHistoryEntry } from "~shared/schema"

export function Work() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<WorkT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.work)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Work">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field(key: keyof WorkT) {
    return {
      value: (draft![key] as string | number | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft({
          ...draft!,
          [key]: key === "yearsExperience" ? Number(e.target.value) : e.target.value
        }),
      onBlur: () => void update("work", { [key]: draft![key] } as Partial<WorkT>)
    }
  }

  return (
    <SectionShell title="Work">
      <div className="grid grid-cols-2 gap-3">
        <TextField id="currentRole" label="Current role" {...field("currentRole")} />
        <TextField id="currentCompany" label="Current company" {...field("currentCompany")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="yearsExperience"
          label="Years of experience"
          type="number"
          min={0}
          {...field("yearsExperience")}
        />
        <TextField
          id="salaryExpectation"
          label="Salary expectation"
          {...field("salaryExpectation")}
        />
      </div>

      <h2 className="pt-4 text-sm font-semibold text-gray-700">History</h2>
      <ArrayEditor<WorkHistoryEntry>
        items={draft.history}
        onChange={(next) => {
          setDraft({ ...draft, history: next })
          void update("work", { history: next })
        }}
        newItem={() => ({ title: "", company: "", start: "" })}
        addLabel="Add role"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Title"
                value={item.title}
                onChange={(e) => set({ title: e.target.value })}
              />
              <TextField
                label="Company"
                value={item.company}
                onChange={(e) => set({ company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Start"
                type="date"
                value={item.start}
                onChange={(e) => set({ start: e.target.value })}
              />
              <TextField
                label="End (leave empty if current)"
                type="date"
                value={item.end ?? ""}
                onChange={(e) => set({ end: e.target.value || undefined })}
              />
            </div>
            <TextArea
              label="Summary"
              rows={2}
              value={item.summary ?? ""}
              onChange={(e) => set({ summary: e.target.value })}
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
```

- [ ] **Step 11.2: Commit**

```bash
git add src/options/sections/Work.tsx
git commit -m "feat(options): Work section with history array editor"
```

---

## Task 12: Education section

**Files:**
- Create: `src/options/sections/Education.tsx`

- [ ] **Step 12.1: Create the file**

```tsx
import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import type { EducationEntry } from "~shared/schema"

export function Education() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Education">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell title="Education">
      <ArrayEditor<EducationEntry>
        items={profile.education}
        onChange={(next) => {
          void replace({ ...profile, education: next })
        }}
        newItem={() => ({ institution: "" })}
        addLabel="Add school"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <TextField
              label="Institution"
              value={item.institution}
              onChange={(e) => set({ institution: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Degree"
                value={item.degree ?? ""}
                onChange={(e) => set({ degree: e.target.value })}
              />
              <TextField
                label="Field of study"
                value={item.field ?? ""}
                onChange={(e) => set({ field: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TextField
                label="Start"
                type="date"
                value={item.start ?? ""}
                onChange={(e) => set({ start: e.target.value })}
              />
              <TextField
                label="End"
                type="date"
                value={item.end ?? ""}
                onChange={(e) => set({ end: e.target.value })}
              />
              <TextField
                label="GPA"
                type="number"
                step="0.01"
                value={item.gpa ?? ""}
                onChange={(e) =>
                  set({ gpa: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      />
    </SectionShell>
  )
}
```

> Note: `education` is a top-level array, not an object section. `ProfileStore.update()` shallow-merges *objects* and would corrupt arrays, so array sections use `replace()` with a manually-spread profile. Same pattern used by Saved answers and Custom fields.

- [ ] **Step 12.2: Commit**

```bash
git add src/options/sections/Education.tsx
git commit -m "feat(options): Education section"
```

---

## Task 13: Startup section

**Files:**
- Create: `src/options/sections/Startup.tsx`

- [ ] **Step 13.1: Create the file**

```tsx
import { useEffect, useState } from "react"
import { TextField, TextArea } from "../components/Field"
import { SectionShell } from "../components/SectionShell"
import { useProfile } from "../use-profile"
import type { Startup as StartupT } from "~shared/schema"

export function Startup() {
  const { profile, update, loaded } = useProfile()
  const [draft, setDraft] = useState<StartupT | null>(null)

  useEffect(() => {
    if (loaded && profile) setDraft(profile.startup)
  }, [loaded, profile])

  if (!draft) {
    return (
      <SectionShell title="Startup">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  function field(key: keyof StartupT) {
    return {
      value: (draft![key] as string | number | undefined) ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const v = e.target.value
        const numeric = key === "coFounderCount" || key === "teamSize"
        setDraft({
          ...draft!,
          [key]: numeric ? (v === "" ? undefined : Number(v)) : v
        })
      },
      onBlur: () => void update("startup", { [key]: draft![key] } as Partial<StartupT>)
    }
  }

  return (
    <SectionShell title="Startup" description="Leave blank if you're not a founder.">
      <TextField id="startupName" label="Startup name" {...field("name")} />
      <TextField id="oneLiner" label="One-line description" {...field("oneLiner")} />
      <TextField id="website" label="Website" {...field("website")} />
      <div className="grid grid-cols-3 gap-3">
        <TextField id="stage" label="Stage" placeholder="idea / mvp / scaling" {...field("stage")} />
        <TextField id="founded" label="Founded" type="date" {...field("foundedDate")} />
        <TextField id="loc" label="Location" {...field("location")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="cofs" label="Co-founders" type="number" min={0} {...field("coFounderCount")} />
        <TextField id="team" label="Team size" type="number" min={0} {...field("teamSize")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField id="industry" label="Industry" {...field("industry")} />
        <TextField id="biz" label="Business model" {...field("businessModel")} />
      </div>
      <TextArea id="traction" label="Traction" rows={2} {...field("traction")} />
      <TextArea id="funding" label="Funding" rows={2} {...field("funding")} />
    </SectionShell>
  )
}
```

- [ ] **Step 13.2: Commit**

```bash
git add src/options/sections/Startup.tsx
git commit -m "feat(options): Startup section"
```

---

## Task 14: Saved answers section

**Files:**
- Create: `src/options/sections/SavedAnswers.tsx`

- [ ] **Step 14.1: Create the file**

```tsx
import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField, TextArea } from "../components/Field"
import { useProfile } from "../use-profile"
import type { SavedAnswer } from "~shared/schema"

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function SavedAnswers() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Saved answers">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      title="Saved answers"
      description="Your go-to answers for common questions (\u201cwhy us\u201d, \u201ccoolest project\u201d, intro video URL, etc). The LLM picks the right one per form.">
      <ArrayEditor<SavedAnswer>
        items={profile.savedAnswers}
        onChange={(next) => {
          void replace({ ...profile, savedAnswers: next })
        }}
        newItem={() => ({ id: uuid(), tags: [], question: "", answer: "" })}
        addLabel="Add answer"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <TextField
              label="Tags (comma-separated)"
              value={item.tags.join(", ")}
              onChange={(e) =>
                set({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                })
              }
              hint="e.g. why us, coolest project, intro video"
            />
            <TextField
              label="Question"
              value={item.question}
              onChange={(e) => set({ question: e.target.value })}
            />
            <TextArea
              label="Answer"
              rows={4}
              value={item.answer}
              onChange={(e) => set({ answer: e.target.value })}
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
```

- [ ] **Step 14.2: Commit**

```bash
git add src/options/sections/SavedAnswers.tsx
git commit -m "feat(options): Saved answers section"
```

---

## Task 15: Custom fields section

**Files:**
- Create: `src/options/sections/CustomFields.tsx`

- [ ] **Step 15.1: Create the file**

```tsx
import { SectionShell } from "../components/SectionShell"
import { ArrayEditor } from "../components/ArrayEditor"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import type { CustomField } from "~shared/schema"

export function CustomFields() {
  const { profile, replace, loaded } = useProfile()
  if (!loaded || !profile) {
    return (
      <SectionShell title="Custom fields">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      title="Custom fields"
      description="Long-tail fields that aren\u2019t in the main schema (tax IDs, visa codes, etc).">
      <ArrayEditor<CustomField>
        items={profile.customFields}
        onChange={(next) => {
          void replace({ ...profile, customFields: next })
        }}
        newItem={() => ({ key: "", value: "", aliases: [] })}
        addLabel="Add field"
        renderRow={(item, _i, set) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Key"
                value={item.key}
                onChange={(e) => set({ key: e.target.value })}
              />
              <TextField
                label="Value"
                value={item.value}
                onChange={(e) => set({ value: e.target.value })}
              />
            </div>
            <TextField
              label="Aliases (comma-separated)"
              value={item.aliases?.join(", ") ?? ""}
              onChange={(e) =>
                set({
                  aliases: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                })
              }
              hint="Helps the LLM match this field across different form wordings"
            />
          </div>
        )}
      />
    </SectionShell>
  )
}
```

- [ ] **Step 15.2: Commit**

```bash
git add src/options/sections/CustomFields.tsx
git commit -m "feat(options): Custom fields section"
```

---

## Task 16: Settings section (self-host URL, export/import, clear)

**Files:**
- Create: `src/options/sections/Settings.tsx`

- [ ] **Step 16.1: Create the file**

```tsx
import { useEffect, useRef, useState } from "react"
import { SectionShell } from "../components/SectionShell"
import { TextField } from "../components/Field"
import { useProfile } from "../use-profile"
import { ProfileSchema } from "~shared/schema"
import { Storage } from "@plasmohq/storage"

const API_URL_KEY = "filler.apiBaseUrl"
const DEFAULT_API_URL = "https://filler.example/api"

export function Settings() {
  const { profile, replace, clearAll, loaded } = useProfile()
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(DEFAULT_API_URL)
  const importInput = useRef<HTMLInputElement>(null)
  const settings = new Storage({ area: "local" })

  useEffect(() => {
    void settings.get<string>(API_URL_KEY).then((v) => {
      if (v) setApiBaseUrl(v)
    })
  }, [])

  async function exportJson() {
    if (!profile) return
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `filler-profile-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      alert("That file isn\u2019t valid JSON.")
      return
    }
    const result = ProfileSchema.safeParse(parsed)
    if (!result.success) {
      alert("That JSON doesn\u2019t match the Filler profile schema.")
      return
    }
    await replace(result.data)
    alert("Profile imported.")
    if (importInput.current) importInput.current.value = ""
  }

  async function onClear() {
    if (!confirm("Erase your entire local profile? This cannot be undone.")) return
    await clearAll()
    alert("Profile cleared.")
  }

  async function saveApiBaseUrl() {
    await settings.set(API_URL_KEY, apiBaseUrl)
  }

  if (!loaded) {
    return (
      <SectionShell title="Settings">
        <p className="text-sm text-gray-500">Loading…</p>
      </SectionShell>
    )
  }

  return (
    <SectionShell title="Settings">
      <div>
        <TextField
          id="apiBaseUrl"
          label="Filler API base URL"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
          onBlur={saveApiBaseUrl}
          hint="The hosted default works for everyone. Override if you self-host the Next.js side."
        />
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Backup</h2>
        <p className="mt-1 text-xs text-gray-500">
          Profile lives only in your browser. Export to a JSON file you keep yourself.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
            Export JSON
          </button>
          <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            Import JSON
            <input
              ref={importInput}
              type="file"
              accept="application/json"
              onChange={importJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Erase everything Filler has stored in this browser.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-100">
          Clear all data
        </button>
      </div>

      <div className="pt-4 text-xs text-gray-500">
        Filler · v0.0.1 · <a href="https://github.com/" className="underline">repo</a>
      </div>
    </SectionShell>
  )
}
```

- [ ] **Step 16.2: Commit**

```bash
git add src/options/sections/Settings.tsx
git commit -m "feat(options): Settings section (API URL, export/import, clear)"
```

---

## Task 17: Options page Layout (left rail + content)

**Files:**
- Create: `src/options/Layout.tsx`

- [ ] **Step 17.1: Create the file**

```tsx
import { useState, type ReactNode } from "react"
import { Identity } from "./sections/Identity"
import { Work } from "./sections/Work"
import { Education } from "./sections/Education"
import { Startup } from "./sections/Startup"
import { SavedAnswers } from "./sections/SavedAnswers"
import { CustomFields } from "./sections/CustomFields"
import { Settings } from "./sections/Settings"

const SECTIONS = [
  { id: "identity", label: "Identity", render: () => <Identity /> },
  { id: "work", label: "Work", render: () => <Work /> },
  { id: "education", label: "Education", render: () => <Education /> },
  { id: "startup", label: "Startup", render: () => <Startup /> },
  { id: "savedAnswers", label: "Saved answers", render: () => <SavedAnswers /> },
  { id: "customFields", label: "Custom fields", render: () => <CustomFields /> },
  { id: "settings", label: "Settings", render: () => <Settings /> }
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

export function Layout() {
  const [active, setActive] = useState<SectionId>("identity")
  const current = SECTIONS.find((s) => s.id === active)!

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4">
        <h1 className="mb-4 text-lg font-semibold">Filler</h1>
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`block w-full rounded px-3 py-2 text-left text-sm ${
                active === s.id ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-4">
          <a
            href="/options/test-page.html"
            target="_blank"
            rel="noreferrer"
            className="block rounded border border-gray-300 px-3 py-2 text-center text-xs hover:bg-gray-100">
            Test on a page
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{current.render() as ReactNode}</main>
    </div>
  )
}
```

- [ ] **Step 17.2: Commit**

```bash
git add src/options/Layout.tsx
git commit -m "feat(options): Layout with left-rail section nav"
```

---

## Task 18: Options page entry (Plasmo wiring)

**Files:**
- Create: `src/options/index.tsx`

- [ ] **Step 18.1: Create the entry**

```tsx
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
```

> Plasmo convention: `src/options/index.tsx` becomes the options page entry. The default export is mounted by Plasmo's runtime; no `ReactDOM.render` needed.

- [ ] **Step 18.2: Commit**

```bash
git add src/options/index.tsx
git commit -m "feat(options): Plasmo options page entry"
```

---

## Task 19: Synthetic test-page form

**Files:**
- Create: `src/options/test-page.html`

This is a small static HTML form the user can open from the options page sidebar. In Plan A it just renders. In Plan C the Fill button will be wired up against it as a smoke check.

- [ ] **Step 19.1: Create the file**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Filler test page</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 560px; margin: 2rem auto; padding: 0 1rem; color: #111; }
      h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
      p.lead { color: #555; margin-top: 0; }
      label { display: block; margin: 0.75rem 0 0.25rem; font-size: 0.85rem; color: #333; }
      input, textarea, select { display: block; width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font: inherit; }
      fieldset { border: 1px solid #ddd; padding: 0.75rem 1rem; margin: 1rem 0; }
      legend { font-size: 0.85rem; color: #333; }
      button { margin-top: 1rem; padding: 0.5rem 1rem; border: 1px solid #333; background: #111; color: white; border-radius: 4px; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Filler test page</h1>
    <p class="lead">A synthetic form for verifying Filler works end-to-end. Plan C will fill this.</p>
    <form>
      <label for="fullName">Full name</label>
      <input id="fullName" name="fullName" type="text" autocomplete="name" />

      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" />

      <label for="linkedin">LinkedIn URL</label>
      <input id="linkedin" name="linkedin" type="url" />

      <label for="company">Company name</label>
      <input id="company" name="company" type="text" />

      <label for="oneLiner">One-line description of what you\u2019re building</label>
      <input id="oneLiner" name="oneLiner" type="text" />

      <label for="country">Country</label>
      <select id="country" name="country">
        <option value="">Select\u2026</option>
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
        <option value="IN">India</option>
        <option value="DE">Germany</option>
      </select>

      <fieldset>
        <legend>Are you technical?</legend>
        <label><input type="radio" name="technical" value="yes" /> Yes</label>
        <label><input type="radio" name="technical" value="no" /> No</label>
      </fieldset>

      <label for="why">Why are you applying?</label>
      <textarea id="why" name="why" rows="5"></textarea>

      <button type="submit">Submit</button>
    </form>
  </body>
</html>
```

- [ ] **Step 19.2: Commit**

```bash
git add src/options/test-page.html
git commit -m "feat(options): synthetic test page for dogfooding"
```

---

## Task 20: Popup stub (setup-status)

**Files:**
- Modify: `src/popup/index.tsx`

- [ ] **Step 20.1: Rewrite the popup**

Replace the contents of `src/popup/index.tsx` with:

```tsx
import "~style.css"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { createProfileStore } from "~background/profile-store"
import { defaultProfile, isProfileEmpty } from "~shared/default-profile"
import type { Profile } from "~shared/schema"

const storage = new Storage({ area: "local" })
const store = createProfileStore(storage)

function IndexPopup() {
  const [profile, setProfile] = useState<Profile>(defaultProfile())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    store.get().then((p) => {
      setProfile(p)
      setLoaded(true)
    })
  }, [])

  function openOptions() {
    chrome.runtime.openOptionsPage?.()
  }

  return (
    <div className="w-72 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-base font-semibold">Filler</h1>
        <button
          onClick={openOptions}
          className="text-xs text-gray-500 hover:underline"
          title="Open settings">
          settings
        </button>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500">Loading\u2026</p>
      ) : isProfileEmpty(profile) ? (
        <button
          onClick={openOptions}
          className="block w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
          Set up your profile (2 min) \u2192
        </button>
      ) : (
        <div>
          <p className="text-sm text-gray-700">
            Profile ready for <span className="font-medium">{profile.identity.fullName}</span>.
          </p>
          <button
            disabled
            title="Coming in the next phase"
            className="mt-3 block w-full cursor-not-allowed rounded-md bg-gray-300 px-3 py-2 text-sm text-gray-700">
            \u26a1 Fill this form (Plan C)
          </button>
          <button
            onClick={openOptions}
            className="mt-2 block w-full text-xs text-gray-500 hover:underline">
            Edit profile
          </button>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
```

- [ ] **Step 20.2: Commit**

```bash
git add src/popup/index.tsx
git commit -m "feat(popup): setup-status stub, Fill button placeholder"
```

---

## Task 21: Update package.json manifest

**Files:**
- Modify: `package.json` (the `"manifest"` block)

- [ ] **Step 21.1: Update the manifest block**

Replace the existing `"manifest"` block at the bottom of `package.json` with:

```json
  "manifest": {
    "name": "Filler",
    "description": "Fill any web form in one click using a profile you set up once.",
    "options_ui": {
      "page": "options.html",
      "open_in_tab": true
    },
    "host_permissions": [
      "https://*/*",
      "http://*/*"
    ],
    "permissions": [
      "tabs",
      "storage"
    ],
    "web_accessible_resources": [
      {
        "resources": ["options/test-page.html"],
        "matches": ["<all_urls>"]
      }
    ]
  }
```

> `options_ui` with `open_in_tab: true` makes our options page open as a full tab (which our Layout assumes) instead of a tiny modal. `web_accessible_resources` exposes `test-page.html` so it can be linked from the sidebar.

- [ ] **Step 21.2: Commit**

```bash
git add package.json
git commit -m "chore(manifest): options page as tab, storage permission, expose test-page"
```

---

## Task 22: Manual verification in Chrome

This is the only non-automated step. Required because Plasmo's dev runtime mounts the options page in a real Chrome instance; we cannot fully exercise it from Vitest.

- [ ] **Step 22.1: Start the dev server**

Run: `pnpm dev:plasmo`
Wait for the line `🟢 INFO ... ready in ...ms`. Leave it running.

- [ ] **Step 22.2: Load the extension into Chrome**

In Chrome: open `chrome://extensions`, enable Developer Mode (top-right toggle), click "Load unpacked", choose the folder `build/chrome-mv3-dev` inside this repo. The extension appears as "Filler".

- [ ] **Step 22.3: Open the options page**

Click "Details" on the Filler card → "Extension options".

Expected:
- Left rail shows: Identity · Work · Education · Startup · Saved answers · Custom fields · Settings, plus a "Test on a page" button at the bottom.
- Identity is selected by default. Form fields render.

- [ ] **Step 22.4: Fill in Identity, verify persistence**

Type a full name and an email. Tab out of each field. Close the tab. Reopen the options page. Expected: the values are still there.

- [ ] **Step 22.5: Click each section**

Click Work, Education, Startup, Saved answers, Custom fields, Settings. Expected: each renders without console errors.

- [ ] **Step 22.6: Export → Clear → Import round-trip**

In Settings: click "Export JSON" — a file downloads.
Click "Clear all data" → confirm. Open Identity → expected: empty.
Back to Settings → "Import JSON" → choose the downloaded file. Open Identity → expected: your name and email are restored.

- [ ] **Step 22.7: Test page link**

Click "Test on a page" in the sidebar. Expected: a new tab opens with the synthetic form. (Filling it does nothing in Plan A — that's Plan C.)

- [ ] **Step 22.8: Popup state**

Click the Filler toolbar icon.
- If you just cleared the profile: expected popup shows "Set up your profile (2 min) \u2192".
- If profile has a name: expected popup shows "Profile ready for \<name\>" and a disabled "Fill this form (Plan C)" button.

- [ ] **Step 22.9: Stop the dev server**

`Ctrl+C` in the terminal running `pnpm dev:plasmo`.

- [ ] **Step 22.10: Document the verification in commit**

```bash
git commit --allow-empty -m "chore: Plan A manual verification complete"
```

---

## Task 23: Run the whole test suite + tidy up

- [ ] **Step 23.1: Full test run**

Run: `pnpm test`
Expected: all tests from Tasks 4, 5, 6, 8, 10 pass. Exit code 0.

- [ ] **Step 23.2: Build the extension once to catch type errors**

Run: `pnpm build:plasmo`
Expected: build completes without TypeScript errors. Output goes to `build/chrome-mv3-prod`.

- [ ] **Step 23.3: Push tag for the milestone**

```bash
git tag plan-a-complete
git log --oneline plan-a-complete~10..plan-a-complete
```

Expected: the log shows ~20 commits made during this plan, all sensibly named.

---

## Acceptance criteria for Plan A

When this plan is complete, all of the following must be true:

1. `pnpm test` exits 0 with all schema, default-profile, profile-store, useProfile, and Identity tests passing.
2. `pnpm build:plasmo` produces a working build in `build/chrome-mv3-prod` with no TypeScript errors.
3. Loading the unpacked dev build into Chrome and opening the options page renders the left rail with all seven sections.
4. Editing Identity fields, closing the page, and reopening it shows the values persisted.
5. Exporting JSON, clearing data, and re-importing the JSON restores the profile.
6. The popup correctly distinguishes between empty and populated profile state.
7. The synthetic test page is reachable from the sidebar.
8. No console errors in the extension service worker or the options page tab during the verification flow.

## Spec sections covered by Plan A

| Spec section | Covered by | Notes |
|---|---|---|
| 4. Profile schema | Tasks 4, 5 | Single source of truth in `src/shared/schema.ts` |
| 4. Editing UX (Options page) | Tasks 9–18 | All seven sections + Layout + entry |
| 3. ProfileStore (background) | Tasks 6, 7 | Backed by `@plasmohq/storage`, schema-validated |
| 6. Popup | Task 20 | Stub only — Fill button is a disabled placeholder until Plan C |
| 4. JSON export / import | Task 16 | In Settings section |
| 8. Privacy posture (local-only profile) | Tasks 6, 7, 16 | Profile never leaves the device in Plan A; no API client wired |
| Test page for dogfooding | Task 19 | Plan C will wire Fill against it |
| 12. Security follow-ups | Task 0 | `.env.example` added, user reminded to rotate key |

## Spec sections deferred to Plan B

- Next.js API endpoints (`/api/health`, `/api/fill`)
- AI SDK + system prompt
- Marketing landing page
- Hard caps + zod request validation

## Spec sections deferred to Plan C

- Content script (`detect`, `extract`, `write`, `overlay`)
- All adapters (`native-select`, `aria-combobox`, `tally-dropdown`, `native-field`, `fallback`)
- `FrameRegistry`, `FillOrchestrator`, `ApiClient` (background)
- Per-field outline annotations
- Floating bottom-right summary toolbar
- Functional Fill button in the popup
- Keyboard shortcut (`Cmd/Ctrl + Shift + F`)
- Adapter unit tests, Playwright e2e suite, `fixtures/founders-inc.html`
