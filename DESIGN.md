---
name: Filler
description: The homepage is a machine-scored answer sheet, and Filler is the pencil.
colors:
  form-green: "#0e7c57"
  form-green-deep: "#0a5c41"
  mint: "#d9f1e2"
  mint-line: "#a9d9bf"
  sheet-paper: "#f8fbf7"
  graphite: "#24262b"
  graphite-soft: "#4a4f57"
  pencil: "#ffc629"
  eraser: "#f28b9a"
  eraser-deep: "#a82a40"
  timing-mark: "#101114"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.4vw, 46px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(38px, 5vw, 68px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  input: "5px"
  button: "6px"
  video: "8px"
  paper: "10px"
spacing:
  row: "34px"
  section: "88px"
components:
  button-primary:
    backgroundColor: "{colors.pencil}"
    textColor: "{colors.timing-mark}"
    rounded: "{rounded.button}"
    padding: "15px 24px"
  button-secondary:
    textColor: "{colors.form-green-deep}"
    rounded: "{rounded.button}"
    padding: "8px 14px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.graphite}"
    rounded: "{rounded.input}"
    height: "34px"
---

# Design System: Filler

## Overview

A US optical answer sheet: form-green printing, paper, graphite marks and black timing marks down the edge. It lives on the homepage (`src/components/landing/sheet.css`, scoped under `.sheet`). SEO pages still use the older grey look in `landing.css` and share only the wordmark. Everything is built to show a form being filled, then let the visitor read the marks.

## Colors

Green fields own whole page regions; colour is never a small accent on white.

### Primary
- **Form green** (#0e7c57): hero and closing bands. White text only.
- **Mint** (#d9f1e2): the clock strip.

### Secondary
- **Pencil** (#ffc629): the install action, and the wordmark's bubble on green.
- **Eraser** (#f28b9a, deep #a82a40): guesses, and the by-hand clock.

### Neutral
- **Sheet paper** (#f8fbf7), **graphite** (#24262b), **timing mark** (#101114).

### Named Rules
**The One Action Rule.** Pencil yellow means Add to Chrome. Nothing else that is clickable gets it.

## Typography

**Font:** Archivo, self-hosted via `next/font`, with the width axis.

### Hierarchy
- **Display and headings** (800, 75% width): sentence case, tight, with 0.06em word spacing so condensed words don't run together.
- **Body** (400, 17px): normal width, under 70ch.
- **Labels** (600, 14px): form field labels, as a real form sets them.

### Named Rules
**The No Label Rule.** No eyebrows or all-caps labels. The form's own labels are the only small type with a job.

## Layout

Full-width bands in a 1240px column, left-aligned. Rows align to the timing track at the page edge. The demo owns the first screen: on a laptop the whole form, through the submit button, is visible without scrolling.

## Elevation & Depth

Flat print, with two exceptions: the hero paper sits above the green, and the pencil button has a soft shadow. No hard offset shadows.

## Shapes

The oval bubble is the signature shape, and also the radio control. Everything else stays lightly rounded.

## Components

### Bubbles
The only state vocabulary: filled (from your profile or a saved answer), half in eraser (a guess to check), empty (left for you).

### Buttons
Pencil primary; outlined green secondary, filling green on hover.

### Inputs / Fields
Look like a real application form: white, hairline border, fixed height so nothing jumps when values land. Guesses take an eraser outline and a "Guess: check this" tag, matching the wording the extension uses.

### Time sheet
Native radios restyled as numbered bubbles. The result always shows its arithmetic.

## Do's and Don'ts

### Do:
- **Do** use measured numbers and say what was measured.
- **Do** show what Filler leaves for you.
- **Do** let the demo explain the product: one or two short lines per section, no explanatory blocks.
- **Do** use a made-up applicant in every demo.

### Don't:
- **Don't** add sound to any demo video.
- **Don't** use pencil yellow for anything but the install action.
- **Don't** show a real inbox, tabs or bookmarks in footage.
- **Don't** invent testimonials, user counts or time-saved studies.
