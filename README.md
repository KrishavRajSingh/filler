# Filler

Forms filled in one click.

Filler is a Chrome extension that reads online forms, understands what each
question is asking, and answers from a saved local profile. It is built for
messy real-world forms, not just simple browser autofill.

## What It Does

- Saves a reusable profile with personal, career, education, startup, project,
  and custom facts.
- Extracts visible form questions from the current page.
- Handles native inputs plus custom controls such as dropdowns, radio groups,
  checkboxes, and ARIA listboxes.
- Uses AI to match differently worded questions to the right profile answer.
- Drafts reviewable answers when a form asks open-ended questions.
- Fills fields only after the user clicks the extension button.
- Does not submit forms.

Example:

```text
Form asks:
When did you finish college?

Your profile has:
Graduation year: 2025

Filler writes:
2025
```

## Tech Stack

- [Plasmo](https://docs.plasmo.com/) for the Chrome extension.
- Next.js for the landing page and local fill API.
- Mastra for the AI fill planner.
- Vercel Analytics for website analytics.
- Vitest + Testing Library for tests.

## Project Structure

```text
src/contents/form-filler.ts      Content script that extracts and fills forms
src/lib/form-extraction.ts       Turns DOM controls into AI-readable fields
src/lib/form-fill.ts             Applies AI fill instructions back to the page
src/lib/form-targets.ts          Finds native and ARIA fill targets
src/lib/profile-storage.ts       Stores the local user profile
src/lib/tab-frames.ts            Coordinates extraction/fill across frames
src/pages/api/fill.ts            Local Next.js API for AI fill planning
src/pages/index.tsx              Landing page
src/pages/debug-form.tsx         Local manual test form
src/components/popup-app.tsx     Extension popup UI
src/components/profile-editor.tsx Profile editor UI
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the extension and local Next.js API together:

```bash
pnpm dev
```

This starts:

- Plasmo dev server for the extension.
- Next.js dev server at `http://localhost:1947`.

Load the development extension from:

```text
build/chrome-mv3-dev
```

Then:

1. Open the extension options page and create a profile.
2. Open `http://localhost:1947/debug-form` or another form page.
3. Click the extension popup.
4. Choose `Fill this form`.

## AI Configuration

The fill API uses Mastra. Configure your local environment with:

```bash
FILLER_MODEL=openai/gpt-5.4
```

Also configure the provider API key required by the selected Mastra model.

## Testing

Run the full test suite:

```bash
pnpm exec vitest run
```

Run TypeScript checks:

```bash
pnpm typecheck
```

## Build

Create production builds for both the extension and Next.js app:

```bash
pnpm build
```

Useful individual commands:

```bash
pnpm build:plasmo
pnpm build:next
```

## Privacy Notes

Filler reads form fields on pages where the extension is active so it can build
a fill request. The saved profile is stored in extension storage. Profile and
form context are sent to the fill API only when the user clicks fill.

The extension should clearly disclose this behavior before any Chrome Web Store
release.

## Current Limitations

- The local development build talks to `http://localhost:1947/api/fill`.
- A production release needs a deployed fill API or another production AI
  execution path.
- The extension fills fields but intentionally does not submit forms.
- File uploads and sensitive fields such as passwords, payment data, and
  government IDs are skipped.

## Chrome Web Store Readiness

Before publishing, verify:

- Production build works from the packaged extension output.
- Backend/API URL is production-ready.
- Store listing, screenshots, icons, and privacy policy are complete.
- Permission disclosures match the extension behavior.
- End-to-end tests pass on representative forms such as Google Forms, Ashby, and
  Tally.
