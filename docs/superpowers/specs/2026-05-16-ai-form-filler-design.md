# AI Form Filler MVP Design

## Summary

Build a Chrome extension that lets users save a structured local profile once, then fill the currently visible form on any website with one click. The profile is user-defined and can contain multiple sections such as personal info, career, startup, projects, team, metrics, and custom facts. The extension extracts visible form fields, sends them with the local profile to the Next.js API, receives a fill plan from a Mastra-powered planner, and applies the values without submitting the form.

The MVP uses the existing Plasmo extension and Next.js app in this repository. It does not require accounts, a database, profile sync, or multi-step form navigation.

## Goals

- Let users create and edit a reusable structured profile inside the extension.
- Store the profile locally in extension storage.
- Fill only the current visible page after the user clicks one button.
- Support common form controls: text inputs, textareas, selects, radios, and checkboxes.
- Support accessible same-tab iframes where the extension content script can run.
- Run AI planning through Mastra inside the Next.js API so prompts, schema validation, and provider logic stay server-side.
- Never submit the form automatically.
- Skip unsafe or uncertain fields instead of guessing.

## Non-Goals

- No backend database or account system for the MVP.
- No website dashboard for profile management in the MVP.
- No automatic multi-step form navigation.
- No automatic clicking of submit, next, payment, or confirmation buttons.
- No filling of passwords, OTPs, payment fields, or sensitive government-ID fields.
- No attempt to bypass browser, site, sandbox, payment, captcha, or extension-store iframe restrictions.

## Architecture

The system has five main parts:

1. Popup
   - Shows "Fill this form".
   - Shows "Edit profile".
   - Displays fill status and summary after a fill attempt.

2. Extension options page
   - Provides the full structured profile editor.
   - Lets users create, edit, reorder, and delete sections and fields.
   - Saves data to extension-local storage.

3. Extension storage
   - Uses Plasmo Storage backed by extension-local storage.
   - Stores the user's structured profile locally.
   - Does not sync to a backend in the MVP.

4. Content script
   - Runs on the current tab when the popup asks it to fill.
   - Extracts visible, enabled form fields and page context from the top page and accessible child frames.
   - Applies the returned fill plan to the page.
   - Dispatches normal `input` and `change` events after setting values.

5. Next.js API
   - Receives the profile, page context, and extracted fields.
   - Calls a Mastra fill planner.
   - Validates and normalizes the response.
   - Returns JSON fill instructions to the extension.

## User Flow

1. User installs or opens the extension.
2. If no profile exists, the popup prompts them to create one.
3. User opens the extension options page and creates structured sections and fields.
4. On any webpage with a form, user opens the popup and clicks "Fill this form".
5. The extension reads only visible, enabled controls on the current page, including accessible same-tab iframes.
6. The extension sends the extracted field context and local profile to the Next.js API.
7. The API returns a fill plan.
8. The content script fills supported fields and skips unsafe or uncertain ones.
9. The popup shows a short summary, for example: "Filled 8 fields, skipped 3."
10. The user reviews the page and submits manually if they choose.

## Profile Model

The profile should be structured but user-defined. Suggested starter sections can be offered, but users can rename or remove them and add their own.

```ts
type UserProfile = {
  sections: ProfileSection[]
}

type ProfileSection = {
  id: string
  title: string
  fields: ProfileField[]
}

type ProfileField = {
  id: string
  label: string
  value: string
}
```

For the MVP, all field values can be stored as strings. This keeps storage and prompt construction simple while still allowing values such as emails, URLs, numbers, short answers, and long text.

Example sections:

- Personal Info
- Career
- Startup
- Projects
- Team
- Metrics
- Custom

## Form Extraction

The content script should collect only fields that are visible and enabled on the current page. It should ignore hidden fields, disabled fields, password fields, submit buttons, reset buttons, file uploads, and known sensitive inputs.

Iframe support is included when Chrome allows the extension content script to run inside the frame. The extension should configure the content script for all frames, collect fields independently per frame, and tag each extracted field with frame context so fill instructions can be routed back to the correct frame. Cross-origin iframes are not readable from the parent page directly, but a content script running inside the frame can extract and fill fields if the extension has permission for that frame URL. Restricted frames, sandboxed frames, captcha frames, payment frames, browser pages, and extension-store pages should be skipped.

Supported controls:

- `input` text-like types such as `text`, `email`, `url`, `tel`, `number`, `date`, and similar safe values.
- `textarea`.
- `select`.
- Radio groups.
- Checkbox groups.

Each extracted field should include:

```ts
type ExtractedField = {
  id: string
  frameId?: number
  frameUrl?: string
  tagName: "input" | "textarea" | "select"
  inputType?: string
  labelText?: string
  ariaLabel?: string
  placeholder?: string
  currentValue?: string
  options?: Array<{
    value: string
    label: string
  }>
  nearbyText?: string
  required?: boolean
}
```

The field `id` is an internal identifier generated by the content script for the current fill attempt. It should map back to the DOM node or field group while applying the fill plan. For iframe fields, the `id` and frame metadata should be enough to route the fill instruction to the frame that owns the field.

Page context should include:

```ts
type PageContext = {
  title: string
  url: string
  headings: string[]
}
```

## Mastra Planner

The MVP should use Mastra as the AI layer inside the Next.js API, but it should not implement a free-running autonomous agent loop.

The first version should use a single Mastra agent/planner call:

- Input: structured profile, page context, and extracted visible fields.
- Output: structured fill instructions matching the fill response schema.
- Validation: use a Zod schema or equivalent runtime schema for structured output.
- Tools: no browser, form, navigation, or submit tools in the MVP.
- Workflows: no multi-step workflow is required for the MVP.

This keeps the implementation simple while still giving the project a clean place to add Mastra workflows later for profile import, multi-step assisted forms, or answer review.

## API Contract

Request:

```ts
type FillRequest = {
  profile: UserProfile
  page: PageContext
  fields: ExtractedField[]
}
```

Response:

```ts
type FillResponse = {
  fields: FillInstruction[]
}

type FillInstruction = {
  fieldId: string
  action: "setValue" | "selectOption" | "check" | "skip"
  value?: string
  confidence: "high" | "medium" | "low"
  reason?: string
}
```

The API should return JSON only. The server should validate the model response before returning it to the extension. Invalid, missing, low-confidence, or unsupported instructions should be converted to `skip`.

## AI Planner Rules

The AI planner should follow these rules:

- Use only the supplied profile and visible page/form context.
- Do not invent profile facts.
- Skip fields when the answer is unclear.
- Prefer exact option labels for dropdowns, radio buttons, and checkboxes.
- Keep generated answers concise unless the field context asks for a long response.
- Never instruct the extension to submit or navigate.
- Skip passwords, OTPs, payment fields, government IDs, file uploads, and other sensitive fields.
- Return JSON that matches the response schema.

## Fill Behavior

The content script should apply instructions conservatively:

- `setValue`: set input or textarea value and dispatch `input` and `change` events.
- `selectOption`: select the closest exact or normalized matching option and dispatch `change`.
- `check`: check a checkbox or radio option only when the returned value clearly matches the available option.
- `skip`: leave the field unchanged.

The extension should not clear existing user-entered values unless the user explicitly triggered a fresh fill and the field is part of the returned plan.

## Error Handling

- If no profile exists, the popup should prompt the user to create one.
- If no visible supported fields are found, show a clear message.
- If the API request fails, leave the page unchanged and show an error.
- If the API returns invalid top-level JSON, leave the page unchanged and show an error.
- If the API returns a valid response with some invalid instructions, apply only validated safe instructions and skip the rest.
- If a returned `fieldId` does not map to a current DOM field, skip it.
- If confidence is low, skip the field.

## Privacy And Data Handling

For the MVP, the profile is stored locally in extension storage. The profile is sent to the Next.js API only when the user clicks "Fill this form".

The MVP should make this clear in the UI:

- "Your profile is stored locally on this browser."
- "When you fill a form, your profile and visible form fields are sent to the AI API to generate answers."

No account sync, backend persistence, or analytics are required for the MVP.

## Verification Plan

Per user direction, the MVP will not include automated tests. Verification should use type checks, builds, and manual browser checks.

Manual verification should cover:

- Profile create, edit, delete, and persistence in extension storage.
- Form extraction for text inputs, textareas, selects, radios, and checkboxes.
- Form extraction and fill routing for accessible same-tab iframes.
- Filtering of hidden, disabled, password, OTP, payment, and file fields.
- Fill-plan application with `input` and `change` events.
- API response validation and malformed model output handling.
- End-to-end behavior on representative visible-page forms.

## Future Work

- Website dashboard with account sync.
- Multiple saved profiles or workspaces.
- Import profile details from resume, LinkedIn, website, or plain text.
- Field-level review before applying answers.
- Multi-step form assistance with explicit user confirmation per step.
- Usage limits, billing, and team profiles.
