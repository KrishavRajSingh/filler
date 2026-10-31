# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: job seekers filling many online applications (Workday, Greenhouse, Lever, Ashby), usually on a laptop in Chrome, retyping a resume they just uploaded. Secondary: anyone with repeat forms (Google Forms, signups, surveys) and healthcare providers on credentialing forms (CAQH, NPI, Medicaid enrollment). US first; never target India.

## Product Purpose

Filler is a Chrome extension that fills web forms from a profile saved once. Success is installs and use that lead to revenue; the only paid test is the Job Hunt Pass.

## Positioning

Filler reads the question on the page, not the hidden field name. It reuses answers you wrote, drafts what you never saved and flags its guesses, and it never submits for you.

## Operating Context

The user clicks Fill in the extension popup on a form that is already open, reads the result, edits, and submits themselves. The core product works without an account.

## Capabilities and Constraints

- Fills text fields, dropdowns, radios, textareas. Leaves file uploads, checkboxes, passwords and payment fields alone. Fields with no hint in the profile stay empty rather than guessed.
- The profile lives in the browser and is sent to Filler's server and an AI model when you click Fill; prod doesn't log it. Never claim it stays fully local.
- Free. Job Hunt Pass: $5 for 30 days, never auto-renews, currently a fake door at /pass (tailored long answers are not built yet).
- Desktop Chrome only; mobile visitors get an emailed install link.
- Next.js 14 pages router, shared `landing.css` used by SEO pages. Umami and Vercel analytics; every new UI gets events.

## Brand Commitments

Name "Filler" (lowercase wordmark allowed). The logo may be redrawn (user, 2026-10-31). No competitor names in titles outside /vs pages. No music on demo video (user feedback, 2026-10-31).

## Evidence on Hand

Own test runs on forms we control: 13 of 13 fields in 5.9 s (credentialing), 9 of 9 in 9.6 s (job form), 7 of 7 in 8.9 s (scholarship); homepage demo form (2026-10-31): 8 filled + 1 guess, 2 left, 3.0 s, second run 5.3 s with the guess left empty. Live forms after the 2026-10-21 model fix: Greenhouse 8 filled in 6.2 s, Lever 9 in 4.9 s, Ashby 4 in 5.5 s; custom dropdowns and voluntary surveys stay empty; Workday untested. Long Ashby application (2026-10-31, 0.0.9): 5 filled including 2 flagged guesses in 4.7 s; resume, other questions and survey left. BuildHop feedback (2026-10-31): "such a simple idea that solves a massive headache". Web Store: ~50 users, 4.9 stars, no written reviews. No testimonials, customer logos or time-saved studies exist; do not invent them.

## Product Principles

- Show the form getting filled before explaining anything.
- Every number is measured or shows its arithmetic.
- You stay in control is the differentiator, not a footnote.
- Say what it can't do.
