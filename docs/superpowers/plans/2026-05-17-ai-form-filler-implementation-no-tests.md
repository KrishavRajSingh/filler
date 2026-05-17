# AI Form Filler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP Chrome extension that stores a structured profile locally, extracts the currently visible form fields, calls a Mastra-powered Next.js fill planner, and applies safe fill instructions without submitting the form.

**Architecture:** Keep schemas and helpers in `src/lib`, profile persistence in Plasmo Storage, UI in focused React components, the all-frame content script in `src/contents`, and Mastra in the Next.js API route. Iframe support is best-effort: accessible frames are handled, restricted frames are skipped.

**Tech Stack:** Plasmo, Chrome extension APIs, React, Next.js pages API routes, Mastra, Zod, Plasmo Storage.

**Testing Decision:** Per user direction, do not add automated tests. Verify with `pnpm typecheck`, builds, and manual browser checks.

---

## Tasks

### Task 1: Dependencies And Manifest

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] Install dependencies: `pnpm add @mastra/core zod`.
- [ ] Add `typecheck`: `tsc --noEmit`.
- [ ] Update manifest permissions to `tabs`, `webNavigation`, and host permissions for `http://*/*` and `https://*/*`.
- [ ] Run `pnpm typecheck`.

### Task 2: Shared Schemas And Storage

**Files:** `src/lib/fill-schemas.ts`, `src/lib/profile-storage.ts`

- [ ] Create Zod schemas/types for `UserProfile`, `ExtractedField`, `PageContext`, `FillRequest`, `FillInstruction`, and `FillResponse`.
- [ ] Include iframe metadata on extracted fields: `frameId?: number`, `frameUrl?: string`.
- [ ] Add profile storage helpers using `@plasmohq/storage`: `createStarterProfile`, `normalizeProfile`, `hasProfileContent`, `getStoredProfile`, and `saveStoredProfile`.
- [ ] Run `pnpm typecheck`.

### Task 3: Profile Editor

**Files:** `src/components/profile-editor.tsx`, `src/options.tsx`

- [ ] Build a structured profile editor with section selection, add section, edit section title, add field, edit field label/value, and remove field.
- [ ] Build `src/options.tsx` to load the local profile, fall back to starter sections, autosave edits, and show the privacy note.
- [ ] Run `pnpm typecheck`.

### Task 4: Popup UI

**Files:** `src/components/popup-app.tsx`, `src/popup/index.tsx`

- [ ] Build popup UI with “Fill this form”, “Edit profile”, loading/error states, and filled/skipped summary.
- [ ] If no useful profile exists, clicking fill should open the options page.
- [ ] Update `src/popup/index.tsx` to render `PopupApp`.
- [ ] Run `pnpm typecheck`.

### Task 5: DOM Extraction And Fill Helpers

**Files:** `src/lib/form-extraction.ts`, `src/lib/form-fill.ts`

- [ ] Implement `extractPageContext(document, url)` for title, URL, and `h1/h2/h3` headings.
- [ ] Implement `extractFieldsFromDocument(document, frame)` for visible enabled `input`, `textarea`, and `select` controls.
- [ ] Skip hidden, disabled, password, file, submit, reset, button, image, OTP/payment/government-ID-like fields where detectable.
- [ ] Generate frame-aware field IDs such as `frame-2-field-0`.
- [ ] Implement `applyFillInstructions(document, instructions)` for `setValue`, `selectOption`, `check`, and `skip`.
- [ ] Dispatch `input` and `change` events after successful fills.
- [ ] Run `pnpm typecheck`.

### Task 6: Content Script And Frame Routing

**Files:** `src/lib/extension-messages.ts`, `src/contents/form-filler.ts`, `src/lib/fill-plan-validation.ts`, `src/lib/tab-frames.ts`, `src/components/popup-app.tsx`

- [ ] Add message contracts for `filler:extract-fields` and `filler:apply-fill`.
- [ ] Add Plasmo content script with `all_frames: true`, `matches: ["http://*/*", "https://*/*"]`, and `run_at: "document_idle"`.
- [ ] Content script should extract fields for its own frame and apply instructions for its own frame.
- [ ] Add validation to parse API output, drop unknown field IDs, and convert low-confidence instructions to `skip`.
- [ ] Add popup-side helpers to collect fields from all accessible frames using `chrome.webNavigation.getAllFrames` and `chrome.tabs.sendMessage`.
- [ ] Route fill instructions back to each owning frame and total filled/skipped counts.
- [ ] Wire popup click flow: collect fields, call `http://localhost:1947/api/fill`, validate response, apply instructions, show summary.
- [ ] Run `pnpm typecheck`.

### Task 7: Mastra Fill Planner API

**Files:** `src/mastra/agents/fill-planner.ts`, `src/mastra/index.ts`, `src/pages/api/fill.ts`

- [ ] Create a Mastra `fill-planner` agent with rules: use only supplied context, do not invent facts, skip unclear/sensitive fields, prefer exact option labels, never submit or navigate.
- [ ] Create the Mastra registry in `src/mastra/index.ts`.
- [ ] Create `POST /api/fill` that validates `FillRequest`, builds a prompt from page/profile/fields, calls the Mastra agent with structured output using `fillResponseSchema`, validates the returned object, and returns `{ fields: [] }` for malformed planner output.
- [ ] Return `400` for invalid requests, `405` for non-POST, and `500` for planner failure.
- [ ] Run `pnpm typecheck`.

### Task 8: Debug Pages And Cleanup

**Files:** `src/pages/debug-form.tsx`, `src/pages/index.tsx`, `src/components/main.tsx`

- [ ] Add a local debug form page with text, email, number, textarea, select, radio, checkbox, and non-submit button controls.
- [ ] Replace `src/pages/index.tsx` with a simple landing page linking to `/debug-form`.
- [ ] Delete `src/components/main.tsx` after `rg "components/main|~components/main" src` returns no matches.
- [ ] Run `pnpm typecheck` and `pnpm build:next`.

### Task 9: README And Manual Verification

**Files:** `README.md`

- [ ] Document `pnpm dev`, loading `build/chrome-mv3-dev`, creating a local profile in the options page, and filling `http://localhost:1947/debug-form`.
- [ ] Document Mastra env setup: `FILLER_MODEL` and the matching provider API key.
- [ ] Run `pnpm typecheck` and `pnpm build`.
- [ ] Manually verify profile save, current-page fill, filled/skipped status, no auto-submit, and accessible iframe behavior.

---

## Self-Review

- Spec coverage: local structured profile storage, popup and options UI, visible-page extraction, accessible iframe routing, Next.js API, Mastra structured planner, conservative fill behavior, privacy messaging, and manual verification are covered.
- User constraint: automated tests are intentionally excluded.
- Placeholder scan: no test scaffolding, Vitest setup, or `test:run` steps are included.
- Main risk: Chrome frame messaging can fail for restricted frames, so inaccessible frames must be ignored while accessible frames continue.
