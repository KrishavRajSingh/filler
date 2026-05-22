# Chrome Web Store listing copy

Paste into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) when you publish v0.0.3.

**What ships in the zip:** title + short description come from `package.json` → `manifest`.  
**What you paste manually:** detailed description below (and screenshots — those matter more than text).

Based on [Chrome's listing guidance](https://developer.chrome.com/docs/webstore/best-listing): lead with a clear benefit in the summary, then overview + scannable bullets in the full description. No keyword spam. One concrete example so people don't have to imagine how it works.

---

## Title

```
Filler – fill forms from your profile
```

Clear function + searchable terms. Brand stays first.

---

## Short description (132 characters max — shows in search)

```
Fill web forms from a saved profile. One click for Google Forms, job apps, Ashby, Tally, and signups.
```

**Why:** Pain + what it is + where people search for this. No jargon. Names real sites people actually use.

---

## Detailed description (paste in dashboard)

```
Tired of typing the same answers on every form? Filler saves your details once and fills web forms in one click.

Example — three questions on the same form:

Form asks: "When did you finish college?"
Your profile: Graduation year — 2025
Filled: 2025

Form asks: "Tell us about yourself?"
Your profile: I build small tools and like teams that ship fast.
Filled: (same answer, reused)

Form asks: "How did you hear about us?"
Your profile: —
Filled: Friend told me about it (draft — you check before submitting)

Works when browser autofill doesn't — Filler reads what's written on the form, not just the hidden field name.

• Save your info once — name, work, school, links, and answers you reuse
• Click Fill — text fields, dropdowns, radios, textareas
• Reuses saved answers when the same question is worded differently
• Drafts what you haven't saved — you review before submitting

Works on Google Forms, Ashby, Tally, job applications, onboarding, and signups.

You click Fill. Filler never submits for you. Won't fill passwords or payment fields. Your profile stays in your browser until you fill a form.
```

**Why this structure:**
1. **Line 1** — Chrome wants an overview sentence up front
2. **Example** — matches the landing page demo: structured field, reused answer, drafted guess
3. **Autofill line** — differentiator in plain English
4. **Bullets** — scannable; aligned with landing page points
5. **Sites line** — search keywords + "is this for my form?"
6. **Last line** — trust without a wall of privacy text

**Keep in sync:** the visual demo on the landing page (`FILL_EXAMPLE` in `src/pages/index.tsx`) is the source of truth. Store copy and screenshot 1 should show the same three questions.

---

## What competitors do (and what we avoid)

| Them | Filler |
|------|--------|
| "Advanced AI" with no example | Concrete before/after |
| Fake/demo data | Your real saved profile |
| Feature dumps | One example + short bullets |
| "Best extension ever" | Specific sites + honest limits |

---

## Still matters more than copy

1. **Screenshot 1:** empty form → filled form (same page)
2. **Screenshot 2:** profile screen
3. **15–30s video:** open form → click extension → Fill → scroll to review

Store visitors decide from images in ~3 seconds. Copy closes the deal after they're interested.

---

## Publish checklist

1. `pnpm build && pnpm package`
2. Upload `build/chrome-mv3-prod.zip` (v0.0.3)
3. Paste **detailed description** above
4. Update screenshots/video if you can
5. Wait for review
