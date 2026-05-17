# Filler — Design Spec

**Date:** 2026-05-17
**Status:** Approved for implementation planning
**Author:** Krishav (with brainstorming partner)

---

## 1. Product summary

Filler is a Chrome extension that lets a user fill out *any* web application form
in one click, using a profile they set up once.

The user maintains a single rich profile (identity, work, education, startup,
saved long-form answers, custom fields). When they encounter an application
form anywhere on the web — job, accelerator, scholarship, fellowship, grant,
generic survey — they click the Filler button (or hit `Cmd/Ctrl + Shift + F`)
and Filler populates as many fields as it can, marking AI-drafted essay
answers in amber for review. The user reviews and submits manually.

The product target is generic: not bound to any specific site, not bound to
any specific application category.

## 2. Goals and non-goals

### v1 goals

- Generic form filling on arbitrary websites, no per-site configuration required
- Profile lives locally in the browser; user data does not leave the device
  except when the LLM fallback is invoked, and even then only the minimum
  fields needed for that call
- One-click "Fill" populates structured fields and drafts essays
- Cross-origin iframe support
- Native `<select>`, generic ARIA combobox, and Tally custom dropdowns
  (Tally is heavily used by accelerator/fellowship forms in our target audience)
- Marketing landing page hosted from the same repo

### Explicit non-goals for v1

- File uploads (résumé, pitch deck)
- Multi-step wizard auto-advance (Workday-style)
- Multiple profiles / persona switcher
- Cloud sync of profile
- Auto-submit
- Mobile or non-Chromium browsers
- Library-specific combobox adapters beyond generic ARIA and Tally
  (react-select, Radix Select, MUI Autocomplete — added on demand in later versions)
- Auth or user accounts on the Next.js side
- Telemetry beyond rate-limit counters

## 3. Architecture

Three components, clean boundaries.

```
┌──────────────────────────────────────────────────────────────────┐
│  CHROME EXTENSION (Plasmo, MV3)                                  │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Popup          │  │ Options page    │  │ Content script   │   │
│  │ • Fill button  │  │ • Profile edit  │  │ • Detect forms   │   │
│  │ • Status       │  │ • Saved answers │  │ • Run heuristics │   │
│  │ • Field count  │  │ • Settings      │  │ • Write values   │   │
│  │ • Settings →   │  │ • Test page btn │  │ • Adapters       │   │
│  └────────┬───────┘  └────────┬────────┘  └────────┬─────────┘   │
│           │                   │                    │             │
│           └──────── Background service worker ─────┘             │
│                       • ProfileStore                             │
│                       • FrameRegistry                            │
│                       • FillOrchestrator                         │
│                       • ApiClient                                │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼──────────────────────────────────┐
│  NEXT.JS APP (port 1947 in dev, hosted in prod)                  │
│  • /                  marketing landing                          │
│  • /api/fill          ai-sdk generateObject → field mapping      │
│  • /api/draft-essay   ai-sdk generateObject → essay drafts       │
│  • /api/health        uptime check                               │
│  Holds OpenAI key in server env. Never shipped to client.        │
└──────────────────────────────────────────────────────────────────┘
```

**Key principle:** the extension is fully functional offline for structured
fields. The Next.js API is contacted only when (a) heuristics couldn't
confidently map a field, or (b) an essay needs a fresh AI draft. This
minimizes cost, latency, and data sent to the server.

### Background service worker responsibilities

- `ProfileStore` — wraps `@plasmohq/storage` (`chrome.storage.local`),
  exposes typed get/set, fires events on profile changes
- `FrameRegistry` — every content-script frame registers itself on load
  with a `frameId` and deregisters on unload; used by the orchestrator
  to fan out fill commands across all frames including cross-origin iframes
- `FillOrchestrator` — on Fill click, broadcasts to all registered frames,
  collects per-frame results, merges them into the on-page overlay summary
- `ApiClient` — typed wrapper around `/api/fill` and `/api/draft-essay`,
  attaches `X-Install-Id` header, handles 429 fallback to offline mode

## 4. Profile schema

Two layers: fixed core sections plus a custom-fields escape hatch.

### Layer 1 — Fixed core sections

```ts
type Profile = {
  schemaVersion: 1
  identity: {
    fullName: string
    preferredName?: string
    email: string
    phone?: string
    location: { city?: string; country?: string; timezone?: string }
    dateOfBirth?: string  // ISO 8601
    pronouns?: string
    citizenship?: string
    workAuth?: string
    links: {
      linkedin?: string
      github?: string
      twitter?: string
      website?: string
    }
  }
  work: {
    currentRole?: string
    currentCompany?: string
    yearsExperience?: number
    salaryExpectation?: string
    history: Array<{
      title: string
      company: string
      start: string  // ISO 8601
      end?: string   // ISO 8601, omit if current
      summary?: string
    }>
  }
  education: Array<{
    institution: string
    degree?: string
    field?: string
    start?: string  // ISO 8601
    end?: string    // ISO 8601
    gpa?: number
  }>
  startup: {                       // optional sub-tree; empty if not a founder
    name?: string
    oneLiner?: string              // "Describe what you are building in one line"
    website?: string
    stage?: string                 // idea | mvp | early-revenue | scaling
    foundedDate?: string           // ISO 8601
    coFounderCount?: number
    teamSize?: number
    industry?: string
    businessModel?: string
    traction?: string              // free-form: MRR, users, milestones
    funding?: string               // free-form: pre-seed, $250k, etc.
    location?: string
  }
  savedAnswers: Array<{
    id: string                     // uuid
    promptTags: string[]           // ["why us", "coolest project", "intro video url"]
    question: string               // the canonical question text
    answer: string                 // user's go-to answer
  }>
  customFields: Array<{
    key: string                    // "TIN"
    value: string                  // "XXXX"
    aliases: string[]              // ["tax id", "taxpayer number"]
  }>
}
```

### Layer 2 — Custom fields

The `customFields` array above. Free-form key/value/aliases for the long tail
(e.g. tax IDs, visa status codes, country-specific identifiers). The heuristic
matcher consults these alongside the core schema.

### Persistence

- Stored in `chrome.storage.local` via `@plasmohq/storage`
- Versioned (`schemaVersion`). Future migrations are pure functions
  applied on read
- JSON import/export available in Options → Settings for manual backup

### Editing UX

- The **Options page** (full-page React) is the editor. Tailwind. Sectioned form,
  autosave on blur, "Test on a page" button that opens a built-in synthetic
  form so the user can dogfood while building their profile.
- The popup is intentionally minimal: status, Fill button, "Edit profile" link.

## 5. Field detection and mapping pipeline

The engine. Sequence on a Fill click:

```
1. DETECT
   Content script scans the current frame's DOM for forms.
   For each form, collect every <input>, <textarea>, <select>,
   plus custom widgets matched by adapter detectors:
     • native-select         ← <select> elements
     • aria-combobox         ← role="combobox" + listbox + option
     • tally-dropdown        ← [data-sentry-component="CustomSelect"]
                                OR <input> + sibling .lucide-chevron-down
                                inside a .tally-block-dropdown ancestor
     • fallback              ← consumes whatever's left, annotates "manual"

2. EXTRACT (per field)
   {
     fieldId,        // stable: prefer .id, fallback to xpath
     tag, type,
     name, id, placeholder, ariaLabel,
     labelText,      // resolved: <label for=id> → wrapping <label>
                     //   → nearest preceding heading/title in the same block
     surroundingText,  // 1-2 preceding TEXT/HEADING blocks ≤ 300 chars
     options?,       // for <select>, radio groups, ARIA listboxes
     isRequired,     // aria-required, required attr, asterisk in title
     adapter         // which adapter claimed this field
   }

3. HEURISTIC MATCH  (offline, in content script)
   For each extracted field:
     candidates = [labelText, ariaLabel, name, placeholder, id]
     bestScore  = max over profile keys + aliases of
                    fuzzy(candidate, key | alias)
     if bestScore >= HIGH (≥ 0.85) → MATCHED   (value from profile)
     elif bestScore >= MED  (≥ 0.55) → TENTATIVE (LLM confirms)
     else                            → UNKNOWN   (LLM decides)

   Essay-style fields (textarea OR title contains a "?" + length > 80 chars):
     embed(question)                                            // see note below
     hit = argmax cosine over savedAnswers (using cached embeddings)
     if hit.score > 0.78 → MATCHED with hit.answer
     else                → NEEDS_DRAFT

   Embedding source: OpenAI text-embedding-3-small via a new
   POST /api/embed endpoint on the Next.js proxy. Embeddings for
   the user's savedAnswers are computed once on save (or on the first
   Fill after an answer was edited) and cached in chrome.storage.local
   alongside the answer. Question embeddings on each fill are also
   POSTed and the result is used in-memory only. Cost is negligible
   (~$0.00002 per call). Rejected alternative: shipping a ~25MB WASM
   model (e.g. all-MiniLM via Transformers.js) inside the extension —
   slower first run, larger install, no real benefit since we already
   have a server proxy.

4. BATCH LLM CALL  (only if any TENTATIVE | UNKNOWN | NEEDS_DRAFT)
   Background worker POSTs to /api/fill:
     {
       installId,
       profile,              // full profile (server holds nothing)
       structuredFields,     // TENTATIVE + UNKNOWN
       essays,               // NEEDS_DRAFT
     }
   Server uses Vercel AI SDK generateObject() with a strict zod schema:
     {
       mappings: {
         [fieldId]: {
           value: string | number | boolean,
           source: "profile" | "draft",
           confidence: number,
           note?: string
         }
       },
       drafts: {
         [fieldId]: { answer: string, note?: string }
       }
     }
   Hard caps server-side: MAX_FIELDS_PER_FILL = 80, MAX_TOKENS = 4000.
   Malformed responses retry once, then fall back to offline mode.

5. WRITE  (per adapter)
   • native input/textarea:  set .value + dispatch 'input' + 'change'
                             (React/Vue/Svelte all listen on these)
   • native select:          fuzzy-match value to option label or value,
                             set .value, dispatch 'change'
   • radio/checkbox:         set .checked, dispatch 'change'
   • ARIA combobox:          click trigger → wait for listbox →
                             keyboard nav or click matching option
   • tally-dropdown:         focus input → wait for option container →
                             fuzzy-match value to rendered option text →
                             click option → blur to commit
   • contenteditable:        execCommand insertText OR set textContent
   • fallback:               do nothing; annotate "fill manually"

6. ANNOTATE
   Each touched field gets a subtle 2px outline:
     • green  → filled from profile (high confidence)
     • amber  → AI draft or low-confidence mapping ("review me")
     • grey   → skipped / fallback
   Floating bottom-right toolbar:
     "Filler · 17 of 22 filled · 3 drafts · review before submit
      [Jump to first review] [Dismiss]"
```

### Iframes

- Manifest sets `"all_frames": true` on the content script
- Each frame (parent + every iframe regardless of origin) runs its own copy
  in its own isolated world and registers with the background's
  `FrameRegistry` on `DOMContentLoaded`
- On Fill click, `FillOrchestrator` fans out the command to every registered
  frame in the active tab; each frame fills its own DOM and reports per-frame
  counts back; the top frame's content script renders the merged overlay
- Sandboxed iframes (`sandbox` without `allow-scripts`) are unreachable;
  they're noted in the overlay as "1 sandboxed iframe — fill manually"

### Multi-page forms

Out of scope for auto-advance in v1 (Tally, Workday, Greenhouse wizards).
A `MutationObserver` watches for major form-subtree replacement and offers
a "new fields detected — fill?" toast on the next page; user clicks Fill again.

### Error handling

| Condition | Behavior |
|---|---|
| Network down | Skip step 4; fill heuristic matches only; toast "Offline — filled X of Y" |
| LLM returns invalid JSON | ai-sdk zod rejects → retry once → fall back to offline |
| Field write throws (frozen / hidden / detached) | Log, skip that field, continue |
| 429 from `/api/fill` | Fall back to offline; toast "Free tier reached — set your own OpenAI key in Settings" |
| Adapter detection conflict (two adapters claim same field) | Higher-priority adapter wins; order: native-select > tally-dropdown > aria-combobox > fallback |

## 6. UI / UX

### Popup (toolbar icon)

```
┌──────────────────────────────────┐
│ Filler                       ⚙   │
│                                  │
│  Detected: 14 fields on this page│
│                                  │
│  ┌────────────────────────────┐  │
│  │     ⚡ Fill this form      │  │
│  └────────────────────────────┘  │
│                                  │
│  Last fill: 11 of 14 · 2 drafts  │
│  → Edit profile                  │
└──────────────────────────────────┘
```

If profile is empty: button replaced with "Set up your profile (2 min)" →
opens options page. Settings gear opens options page directly.

### Options page (full-page React at `options.html`)

- Left rail navigation: Identity · Work · Education · Startup · Saved answers ·
  Custom fields · Settings
- Right pane: section form, autosave on blur, validation errors inline
- Top-right utility bar: "Test on a page" (opens built-in synthetic form in a new tab),
  "Export JSON", "Import JSON"
- Settings section: Clear all data · BYOK OpenAI key field · About / version /
  link to repo · Toggle for "self-hosted API base URL" (advanced)

### On-page overlay (injected after a Fill)

```
┌─────────────────────────────────────────────┐
│ Filler · filled 11 of 14 fields             │
│ • 2 AI drafts need your review (amber)      │
│ • 1 select couldn't auto-pick (grey)        │
│ [Jump to first review]   [Dismiss]          │
└─────────────────────────────────────────────┘
```

Plus per-field outlines per Section 5 step 6.

### Keyboard shortcut

`Cmd/Ctrl + Shift + F` — triggers Fill. User-configurable at
`chrome://extensions/shortcuts`.

### Styling

- Tailwind for the options page (full React app, deserves a real CSS system)
- Popup and overlay use scoped CSS-in-JS via Plasmo's CSS isolation so styles
  do not leak into host pages

## 7. Server: Next.js API

### Library choice

Vercel AI SDK (`ai` + `@ai-sdk/openai`). `generateObject({ schema })` with a
strict zod schema for both endpoints. Provider-agnostic so we can swap to
Anthropic / Groq / etc. by changing one import.

Not chosen: Mastra (overkill — no agents, no workflows, no RAG), LiteLLM
(Python; wrong stack), raw OpenAI SDK (acceptable but no provider abstraction).

### Endpoints

```
GET  /api/health
     → { ok: true, version }

POST /api/fill
     Headers:
       X-Install-Id: <uuid>
       X-User-OpenAI-Key?: <sk-...>    (BYOK; bypasses rate limit)
     Body: { profile, structuredFields[], essays[] }
     → { mappings, drafts }

POST /api/draft-essay
     Headers: same as above
     Body: { profile, question, savedAnswerContext[] }
     → { answer, note? }

POST /api/embed
     Headers: same as above
     Body: { texts: string[] }
     → { vectors: number[][] }   (text-embedding-3-small, 1536-dim)
```

### Rate limit

- Per-install: 30 fills / day (Upstash Redis counter keyed by `X-Install-Id`)
- 429 over-limit triggers extension's BYOK toast
- BYOK requests bypass the rate limit; server passes the user's key straight
  through to the provider and stores nothing

### Hard caps

- `MAX_FIELDS_PER_FILL = 80`
- `MAX_TOKENS_PER_CALL = 4000`
- Request body validated by zod at the edge; oversized payloads rejected 413

### Logging

Per request: install ID, field counts, latency, success/failure code. **Never**
field values, **never** profile contents. Documented in the README and in the
Options page's privacy blurb.

## 8. Privacy posture

- Profile lives in `chrome.storage.local`. It leaves the device only during
  step 4 (LLM fallback) and only the fields the server needs.
- Server logs are metadata only (no values, no profile contents).
- No analytics SDK in the extension. No third-party trackers.
- Code is open source. Users can self-host the Next.js side and point the
  extension at it via `FILLER_API_BASE_URL` in Options → Settings.
- README and Options page surface these guarantees explicitly.

## 9. Testing strategy

Three layers, each catching a different class of bug.

| Layer | Tool | Catches |
|---|---|---|
| **Unit** | Vitest | Heuristic matcher, fuzzy scoring, schema migrations, adapter detection booleans, embedding similarity. Pure functions. |
| **Adapter integration** | Vitest + happy-dom | Each adapter against an HTML fixture pulled from a real site. New site breaks → new fixture. |
| **End-to-end** | Playwright | Load the extension into headless Chromium. Run Fill against `fixtures/founders-inc.html` (the canonical Tally fixture) and a synthetic multi-frame page. Assert per-field expected values, including all 5 Tally dropdowns and a cross-origin iframe. |

### Canonical fixture

`fixtures/founders-inc.html` is a saved copy of the Founders, Inc.
application form (page 2). It exercises:

- 11 plain `<input>` (text / email / number / URL)
- 3 textareas (essay system: 2 saved-answer hits expected, 1 AI draft)
- 7 radio buttons across 3 groups (LLM-routed)
- 5 Tally custom dropdowns (Tally adapter)
- 1 `RESPONDENT_COUNTRY` widget (Tally country picker; verifies post-mount scan)

CI runs all three layers on every PR. The Playwright suite doubles as living
documentation of what Filler supports.

## 10. Repository layout (post-implementation)

```
filler/
├── src/
│   ├── background/
│   │   ├── index.ts              # service worker entry
│   │   ├── profile-store.ts
│   │   ├── frame-registry.ts
│   │   ├── fill-orchestrator.ts
│   │   └── api-client.ts
│   ├── content/
│   │   ├── index.ts              # MutationObserver + form detect
│   │   ├── extract.ts
│   │   ├── heuristic-match.ts
│   │   ├── embed-match.ts        # essay similarity (small local model or hashed embedding cache)
│   │   ├── write.ts
│   │   ├── overlay.tsx
│   │   └── adapters/
│   │       ├── native-select.ts
│   │       ├── aria-combobox.ts
│   │       ├── tally-dropdown.ts
│   │       └── fallback.ts
│   ├── popup/
│   │   └── index.tsx
│   ├── options/
│   │   ├── index.tsx
│   │   ├── sections/
│   │   │   ├── identity.tsx
│   │   │   ├── work.tsx
│   │   │   ├── education.tsx
│   │   │   ├── startup.tsx
│   │   │   ├── saved-answers.tsx
│   │   │   ├── custom-fields.tsx
│   │   │   └── settings.tsx
│   │   └── test-page.html
│   ├── pages/                    # Next.js
│   │   ├── index.tsx             # marketing landing
│   │   └── api/
│   │       ├── fill.ts
│   │       ├── draft-essay.ts
│   │       └── health.ts
│   └── shared/
│       ├── schema.ts             # zod profile schema + types
│       └── prompts.ts            # LLM prompt templates
├── fixtures/
│   └── founders-inc.html
├── tests/
│   ├── unit/
│   ├── adapter/
│   └── e2e/
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-17-filler-design.md     ← this file
```

## 11. Open questions deferred to v1.1+

- Multi-step wizard auto-advance (Workday, Greenhouse)
- File uploads (résumé, pitch deck) — store + attempt DataTransfer attach
- Multiple profiles / persona switcher
- Cloud sync of profile
- Library-specific combobox adapters: react-select, Radix Select, MUI Autocomplete
- Local LLM option (Ollama or Chrome's built-in `window.ai`)
- Analytics opt-in
- Auth on the Next.js side (only if we add cloud sync)

## 12. Security follow-ups (before v1 ship)

- Rotate the OpenAI key currently committed in `.env`; remove `.env` from
  git history; add `.env*` to `.gitignore`; use `.env.example` for documentation.
- The proxy must never echo profile contents in error responses.
- BYOK keys must never be persisted server-side; only passed through to the
  provider per-request.
