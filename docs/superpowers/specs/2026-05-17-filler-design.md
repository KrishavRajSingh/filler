# Filler — Design Spec

**Date:** 2026-05-17
**Status:** Approved for implementation planning
**Author:** Krishav (with brainstorming partner)

---

## 1. Product summary

Filler is a Chrome extension that lets a user fill out *any* web application
form in one click, using a profile they set up once.

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

- Generic form filling on arbitrary websites, no per-site configuration
- Profile lives locally in the browser; nothing leaves the device except
  during a Fill call to the user's chosen API
- One click → populate every fillable field, including essays
- Cross-origin iframe support
- Native `<select>`, generic ARIA combobox, and Tally custom dropdowns
  (Tally is heavily used by accelerator / fellowship forms)
- Marketing landing page hosted from the same repo
- Self-host setting (the extension can point at any compatible API URL)

### Explicit non-goals for v1

- File uploads (résumé, pitch deck)
- Multi-step wizard auto-advance (Workday-style)
- Multiple profiles / persona switcher
- Cloud sync of profile
- Auto-submit
- Mobile or non-Chromium browsers
- Library-specific combobox adapters beyond generic ARIA and Tally
  (react-select, Radix Select, MUI Autocomplete — added on demand)
- Auth or user accounts
- Rate limiting / abuse protection (watch the OpenAI bill; add when needed)
- BYOK (Bring Your Own Key) — add when first user asks
- Embedding pipeline / saved-answer similarity matching
  (the LLM picks the right saved answer directly)
- Telemetry / analytics

## 3. Architecture

Three components, clean boundaries.

```
┌──────────────────────────────────────────────────────────────────┐
│  CHROME EXTENSION (Plasmo, MV3)                                  │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Popup          │  │ Options page    │  │ Content script   │   │
│  │ • Fill button  │  │ • Profile edit  │  │ • Detect forms   │   │
│  │ • Status       │  │ • Saved answers │  │ • Extract schema │   │
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
│  • /api/health        uptime check                               │
│  Holds OpenAI key in server env. Never shipped to client.        │
└──────────────────────────────────────────────────────────────────┘
```

The extension does the work of finding and writing form fields. The LLM does
the work of mapping profile data (and drafting essays) to those fields.

### Background service worker responsibilities

- `ProfileStore` — wraps `@plasmohq/storage` (`chrome.storage.local`),
  typed get/set, fires events on profile changes
- `FrameRegistry` — every content-script frame registers itself on load
  with a `frameId` and deregisters on unload; used by the orchestrator
  to fan out fill commands across all frames including cross-origin iframes
- `FillOrchestrator` — on Fill click, broadcasts to all registered frames,
  collects per-frame extracted schemas, makes ONE batched `/api/fill` call
  with everything, dispatches mappings back to each frame for writing,
  merges per-frame results into the on-page overlay summary
- `ApiClient` — typed wrapper around `/api/fill`, uses the configured
  `FILLER_API_BASE_URL` setting (defaults to the hosted URL)

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
    start?: string
    end?: string
    gpa?: number
  }>
  startup: {                       // optional sub-tree; empty if not a founder
    name?: string
    oneLiner?: string
    website?: string
    stage?: string                 // idea | mvp | early-revenue | scaling
    foundedDate?: string
    coFounderCount?: number
    teamSize?: number
    industry?: string
    businessModel?: string
    traction?: string              // free-form
    funding?: string               // free-form
    location?: string
  }
  savedAnswers: Array<{
    id: string                     // uuid
    tags: string[]                 // ["why us", "coolest project", "intro video"]
    question: string               // canonical question text
    answer: string                 // user's go-to answer
  }>
  customFields: Array<{
    key: string                    // "TIN"
    value: string                  // "XXXX"
    aliases?: string[]             // optional helpers for the LLM
  }>
}
```

Saved answers are passed to the LLM as part of the profile. The LLM picks
the right one for each essay-style question (or drafts a fresh answer from
the rest of the profile if nothing in `savedAnswers` is a good fit). No
separate embedding system needed.

### Layer 2 — Custom fields

The `customFields` array. Free-form key/value for the long tail
(e.g. tax IDs, visa codes). The LLM reads them along with everything else.

### Persistence

- Stored in `chrome.storage.local` via `@plasmohq/storage`
- Versioned (`schemaVersion`). Future migrations are pure functions applied on read
- JSON import/export available in Options → Settings for manual backup

### Editing UX

- The **Options page** (full-page React) is the editor. Tailwind. Sectioned
  form, autosave on blur, "Test on a page" button that opens a built-in
  synthetic form so the user can dogfood while building their profile.
- The popup is intentionally minimal: status, Fill button, "Edit profile" link.

## 5. Field detection and mapping pipeline

LLM-first. One round trip per fill. Sequence on a Fill click:

```
1. DETECT (per frame, in parallel)
   Each content-script frame scans its DOM for forms.
   For each form, collects every fillable element via adapter detectors:
     • native-select         ← <select> elements
     • aria-combobox         ← role="combobox" + listbox + option
     • tally-dropdown        ← [data-sentry-component="CustomSelect"]
                                OR <input> + sibling .lucide-chevron-down
                                inside a .tally-block-dropdown ancestor
     • native-field          ← <input>, <textarea>, radio, checkbox
     • fallback              ← consumes whatever's left, annotates "manual"

2. EXTRACT (per element)
   {
     fieldId,            // stable: prefer .id, fallback to xpath
     adapter,            // which adapter claimed this element
     tag, type,
     name, id, placeholder, ariaLabel,
     labelText,          // resolved: <label for=id> → wrapping <label>
                         //   → nearest preceding heading/title in same block
     surroundingText,    // 1-2 preceding TEXT/HEADING blocks ≤ 300 chars
     options?,           // for <select>, radio groups, listboxes
     isRequired
   }

3. CALL /api/fill  (background service worker, ONE call per Fill)
   POST { profile, frames: [{ frameId, fields[] }] }
   Server uses Vercel AI SDK generateObject() with a strict zod schema:
     {
       mappings: {
         [frameId]: {
           [fieldId]: {
             value: string | number | boolean,
             source: "profile" | "draft" | "skipped",
             confidence: "high" | "medium" | "low",
             note?: string        // brief reason, shown on hover
           }
         }
       }
     }
   Hard caps server-side: MAX_FIELDS_PER_FILL = 80, MAX_TOKENS = 8000.
   Malformed responses retry once, then surface an error to the user.
   Optional: stream the response so values appear progressively rather
   than all at once. (Polish, not required for v1.)

4. WRITE  (per frame, per adapter)
   • native input/textarea:  set .value + dispatch 'input' + 'change'
                             (React/Vue/Svelte all listen on these)
   • native select:          fuzzy-match value to option label OR value,
                             set .value, dispatch 'change'
   • radio/checkbox:         set .checked, dispatch 'change'
   • ARIA combobox:          click trigger → wait for listbox →
                             keyboard nav or click matching option
   • tally-dropdown:         focus input → wait for option container →
                             fuzzy-match LLM value to rendered option text →
                             click option → blur to commit
   • contenteditable:        execCommand insertText OR set textContent
   • fallback:               do nothing; annotate "fill manually"

5. ANNOTATE
   Each touched field gets a subtle 2px outline:
     • green  → high-confidence value from profile
     • amber  → AI draft or medium-confidence ("review me")
     • grey   → skipped / fallback / source="skipped"
   Floating bottom-right toolbar:
     "Filler · 17 of 22 filled · 3 drafts · review before submit
      [Jump to first review] [Dismiss]"
```

### Why LLM-first

The whole pipeline trusts the LLM for the mapping. We considered a heuristic
pre-pass (cheap string-similarity matching of profile keys against label
text, escaping to the LLM only for unmatched fields) and rejected it:

- At 2026 prices, ~$0.0008 per fill with `gpt-4o-mini` or `gemini-2.0-flash`
- Heuristics only win on cases the LLM trivially handles anyway
- Heuristics get confidently wrong on ambiguous labels
  ("Phone (mobile)" vs "Phone (work)" both fuzzy-match "phone")
- Removing the heuristic + embedding subsystem cuts ~40 % of v1 code

### Iframes

- Manifest sets `"all_frames": true` on the content script
- Each frame (parent + every iframe) runs its own content-script instance
  in its own isolated world and registers with `FrameRegistry` on
  `DOMContentLoaded`
- On Fill click, `FillOrchestrator` collects extracted fields from every
  registered frame in the active tab, sends them in ONE `/api/fill` call
  (frames keyed by `frameId`), then dispatches each frame's mappings back
  for writing
- Sandboxed iframes (`sandbox` without `allow-scripts`) are unreachable;
  noted in the overlay as "1 sandboxed iframe — fill manually"

### Multi-page forms

Out of scope for auto-advance in v1 (Tally, Workday, Greenhouse wizards).
A `MutationObserver` watches for major form-subtree replacement and offers
a "new fields detected — fill?" toast on the next page; user clicks Fill again.

### Error handling

| Condition | Behavior |
|---|---|
| Network down | Toast "Filler needs network to think — try again when online" |
| Server 5xx or timeout | Toast "Filler service is down — try again in a moment"; no fields written |
| LLM returns invalid JSON | ai-sdk zod rejects → retry once → surface error |
| Field write throws (frozen / hidden / detached) | Log, skip that field, continue with the rest |
| Adapter detection conflict (two adapters claim same field) | Higher-priority adapter wins; order: native-select > tally-dropdown > aria-combobox > native-field > fallback |

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

- Left rail: Identity · Work · Education · Startup · Saved answers ·
  Custom fields · Settings
- Right pane: section form, autosave on blur, validation errors inline
- Top-right utility bar: "Test on a page" (opens built-in synthetic form
  in a new tab), "Export JSON", "Import JSON"
- Settings: Clear all data · `FILLER_API_BASE_URL` field (for self-host) ·
  About / version / link to repo

### On-page overlay (injected after a Fill)

```
┌─────────────────────────────────────────────┐
│ Filler · filled 11 of 14 fields             │
│ • 2 AI drafts need your review (amber)      │
│ • 1 select couldn't auto-pick (grey)        │
│ [Jump to first review]   [Dismiss]          │
└─────────────────────────────────────────────┘
```

Plus per-field outlines per Section 5 step 5.

### Keyboard shortcut

`Cmd/Ctrl + Shift + F` — triggers Fill. User-configurable at
`chrome://extensions/shortcuts`.

### Styling

- Tailwind for the options page (full React app)
- Popup and overlay use scoped CSS-in-JS via Plasmo's CSS isolation so
  styles do not leak into host pages

## 7. Server: Next.js API

### Library choice

Vercel AI SDK (`ai` + `@ai-sdk/openai`). `generateObject({ schema })` with
a strict zod schema. Provider-agnostic so we can swap to Anthropic /
Google / Groq / etc. by changing one import.

Not chosen: Mastra (overkill — no agents, no workflows, no RAG), LiteLLM
(Python; wrong stack), raw OpenAI SDK (acceptable but no provider abstraction).

### Endpoints

```
GET  /api/health
     → { ok: true, version }

POST /api/fill
     Body: { profile, frames: [{ frameId, fields[] }] }
     → { mappings: { [frameId]: { [fieldId]: { value, source, confidence, note? } } } }
```

That's it. No `/api/draft-essay` (essays are part of `/api/fill`), no
`/api/embed` (no embedding pipeline), no auth, no rate limiting.

### Model choice

Default: `gpt-4o-mini` for cost/latency balance (~1–2 s, ~$0.0008/fill).
Swappable via server env var `FILLER_MODEL`. The system prompt instructs
the model to:

- Map structured fields directly from profile values when the answer is
  unambiguous (use `source: "profile"`, `confidence: "high"`)
- Pick from `savedAnswers` for essay/long-form questions when there's a
  good match (use `source: "profile"`, `confidence: "high|medium"`)
- Draft fresh answers from the rest of the profile when nothing in
  `savedAnswers` fits (use `source: "draft"`)
- Set `source: "skipped"` and `value: null` for fields it cannot map
  with reasonable confidence
- Honor option lists exactly — for select/radio/combobox fields, value
  MUST be one of the provided options or the field is skipped

### Hard caps

- `MAX_FIELDS_PER_FILL = 80`
- `MAX_TOKENS_PER_CALL = 8000`
- Request body validated by zod at the edge; oversized payloads rejected 413

### Logging

Per request: timestamp, total field count, latency, model, success/failure
code. **Never** field values, **never** profile contents.

## 8. Privacy posture

- Profile lives in `chrome.storage.local`. It leaves the device only when
  the user clicks Fill, and goes only to the URL set in
  `FILLER_API_BASE_URL` (defaults to the hosted API).
- Server logs are metadata only (no field values, no profile contents).
- No analytics SDK in the extension. No third-party trackers.
- Code is open source. Users can self-host the Next.js side and point the
  extension at it via the `FILLER_API_BASE_URL` setting.
- README and Options page surface these guarantees explicitly.

## 9. Testing strategy

Three layers, each catching a different class of bug.

| Layer | Tool | Catches |
|---|---|---|
| **Unit** | Vitest | Schema migrations, adapter detection booleans, value-writing primitives, fuzzy option-matching for native selects. Pure functions. |
| **Adapter integration** | Vitest + happy-dom | Each adapter against an HTML fixture pulled from a real site. New site breaks something → new fixture. |
| **End-to-end** | Playwright | Load the extension into headless Chromium. Mock `/api/fill` for deterministic mappings. Run Fill against `fixtures/founders-inc.html` and a synthetic multi-frame page. Assert per-field expected values, including all 5 Tally dropdowns and a cross-origin iframe. |

### Canonical fixture

`fixtures/founders-inc.html` is a saved copy of the Founders, Inc.
application form (page 2). It exercises:

- 11 plain `<input>` (text / email / number / URL)
- 3 textareas (LLM picks from savedAnswers or drafts)
- 7 radio buttons across 3 groups (LLM-routed)
- 5 Tally custom dropdowns (Tally adapter)
- 1 `RESPONDENT_COUNTRY` widget (Tally country picker; verifies post-mount scan)

CI runs all three layers on every PR. The Playwright suite doubles as
living documentation of what Filler supports.

### Why we mock the LLM in CI

Real LLM calls in CI are slow, flaky, costly, and non-deterministic. We
write a separate small "live LLM" test suite (not in CI) that engineers
run locally before a release to verify the real model still produces
sensible mappings against the same fixtures.

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
│   │   ├── write.ts
│   │   ├── overlay.tsx
│   │   └── adapters/
│   │       ├── native-select.ts
│   │       ├── aria-combobox.ts
│   │       ├── tally-dropdown.ts
│   │       ├── native-field.ts
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
│   │       └── health.ts
│   └── shared/
│       ├── schema.ts             # zod profile + request/response schemas
│       └── prompts.ts            # LLM prompt template
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

## 11. Deferred to v1.1+

- Multi-step wizard auto-advance (Workday, Greenhouse)
- File uploads (résumé, pitch deck) — store + attempt DataTransfer attach
- Multiple profiles / persona switcher
- Cloud sync of profile
- Library-specific combobox adapters: react-select, Radix Select, MUI Autocomplete
- BYOK (Bring Your Own Key) — add the first time a user requests it
- Rate limiting — add the day usage warrants defending the bill
- Local LLM (Ollama / Chrome `window.ai` / Gemini Nano)
- Analytics opt-in
- Auth on the Next.js side (only if cloud sync arrives)

## 12. Security follow-ups (before v1 ship)

- **Rotate the OpenAI key currently committed in `.env`.** Remove from git
  history, add `.env*` to `.gitignore`, use `.env.example` for documentation.
- The proxy must never echo profile contents or field values in error
  responses or logs.
