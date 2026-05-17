import type { FillInstruction } from "./fill-schemas"

type FillResult = {
  filled: number
  skipped: number
}

const unsafeInputTypes = new Set([
  "hidden",
  "password",
  "file",
  "submit",
  "reset",
  "button",
  "image"
])

export function applyFillInstructions(
  doc: Document,
  instructions: FillInstruction[]
): FillResult {
  const controls = Array.from(
    doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select"
    )
  )

  let filled = 0
  let skipped = 0

  for (const instruction of instructions) {
    if (instruction.confidence === "low" || instruction.action === "skip") {
      skipped += 1
      continue
    }

    const index = getFieldIndex(instruction.fieldId)
    const control = controls[index]
    if (!control || !isFillable(control)) {
      skipped += 1
      continue
    }

    const didFill = applyInstruction(control, instruction)
    if (didFill) filled += 1
    else skipped += 1
  }

  return { filled, skipped }
}

function applyInstruction(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  instruction: FillInstruction
) {
  if (instruction.action === "setValue") {
    if (control instanceof HTMLSelectElement || control instanceof HTMLInputElement && isChoiceInput(control)) {
      return false
    }

    control.value = instruction.value ?? ""
    dispatchFormEvents(control)
    return true
  }

  if (instruction.action === "selectOption" && control instanceof HTMLSelectElement) {
    const option = Array.from(control.options).find(
      (candidate) =>
        normalize(candidate.label) === normalize(instruction.value) ||
        normalize(candidate.value) === normalize(instruction.value)
    )

    if (!option) return false

    control.value = option.value
    dispatchFormEvents(control)
    return true
  }

  if (instruction.action === "check" && control instanceof HTMLInputElement) {
    if (!isChoiceInput(control)) return false

    if (instruction.value && !choiceMatches(control, instruction.value)) {
      return false
    }

    control.checked = true
    dispatchFormEvents(control)
    return true
  }

  return false
}

function isFillable(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (control.disabled) return false

  if (control instanceof HTMLInputElement) {
    return !unsafeInputTypes.has(control.type.toLowerCase())
  }

  return true
}

function isChoiceInput(control: HTMLInputElement) {
  return control.type === "checkbox" || control.type === "radio"
}

function choiceMatches(control: HTMLInputElement, value: string) {
  const candidates = [
    control.value,
    control.getAttribute("aria-label"),
    findLabelText(control)
  ]

  return candidates.some((candidate) => normalize(candidate) === normalize(value))
}

function findLabelText(element: HTMLElement) {
  if (element.id) {
    const label = element.ownerDocument.querySelector(
      `label[for="${CSS.escape(element.id)}"]`
    )
    const text = normalizeText(label?.textContent)
    if (text) return text
  }

  return normalizeText(element.closest("label")?.textContent)
}

function dispatchFormEvents(element: HTMLElement) {
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? ""
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

function getFieldIndex(fieldId: string) {
  const match = fieldId.match(/field-(\d+)$/)
  return match ? Number(match[1]) : -1
}
