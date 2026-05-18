import type { FillInstruction } from "./fill-schemas"
import {
  collectFillTargets,
  extractAriaOptions,
  type FillTarget
} from "./form-targets"

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
const tallyOptionWaitTimeoutMs = 750
const tallyOptionPollMs = 25

export async function applyFillInstructions(
  doc: Document,
  instructions: FillInstruction[]
): Promise<FillResult> {
  const targets = collectFillTargets(doc)

  let filled = 0
  let skipped = 0

  for (const instruction of instructions) {
    if (instruction.confidence === "low" || instruction.action === "skip") {
      skipped += 1
      continue
    }

    const index = getFieldIndex(instruction.fieldId)
    const target = targets[index]
    if (!target || !isFillable(target)) {
      skipped += 1
      continue
    }

    const didFill = await applyInstruction(target, instruction)
    if (didFill) filled += 1
    else skipped += 1
  }

  return { filled, skipped }
}

async function applyInstruction(
  target: FillTarget,
  instruction: FillInstruction
) {
  const control = target.control

  if (instruction.action === "setValue") {
    if (
      control instanceof HTMLSelectElement ||
      (control instanceof HTMLInputElement && isChoiceInput(control)) ||
      !(
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement
      )
    ) {
      return false
    }

    setControlValue(control, instruction.value ?? "")
    dispatchFormEvents(control)
    return true
  }

  if (instruction.action === "selectOption") {
    if (target.kind === "aria-listbox") {
      return await selectAriaOption(
        control,
        "option",
        instruction.value,
        target.block
      )
    }

    if (target.kind === "aria-radio-group") {
      return await selectAriaOption(
        target.block ?? target.element,
        "radio",
        instruction.value
      )
    }

    if (target.kind === "aria-checkbox-group") {
      return await selectAriaOption(
        target.block ?? target.element,
        "checkbox",
        instruction.value
      )
    }

    if (control instanceof HTMLSelectElement) {
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

    if (control instanceof HTMLInputElement && isChoiceInput(control)) {
      return checkChoiceInput(control, instruction.value)
    }

    if (
      control instanceof HTMLInputElement &&
      isTallyDropdownControl(control)
    ) {
      return await selectTallyDropdownOption(control, instruction.value)
    }
  }

  if (instruction.action === "check" && control instanceof HTMLInputElement) {
    if (!isChoiceInput(control)) return false

    return checkChoiceInput(control, instruction.value)
  }

  return false
}

async function selectAriaOption(
  container: HTMLElement,
  role: "checkbox" | "option" | "radio",
  value?: string,
  block?: HTMLElement
) {
  if (!value) return false

  if (role === "option") {
    if (commitListboxValue(container, value, block)) return true

    dispatchMouseSequence(container)
    await wait(50)
  }

  const option = findAriaOption(container, role, value)
  if (!option) return false

  dispatchMouseSequence(option.element)
  dispatchFormEvents(option.element)
  await wait(50)

  if (role === "option") {
    if (hasSelectedAriaOption(container, value)) {
      container.setAttribute("aria-expanded", "false")
      return true
    }

    return commitListboxValue(container, value, block)
  }

  return option.element.getAttribute("aria-checked") === "true"
}

function findAriaOption(
  container: HTMLElement,
  role: "checkbox" | "option" | "radio",
  value: string
) {
  const options = extractAriaOptions(container, role).filter(
    (candidate) => normalize(candidate.label) === normalize(value)
  )

  return options.find((option) => hasUsableBox(option.element)) ?? options[0]
}

function hasSelectedAriaOption(container: HTMLElement, value: string) {
  return extractAriaOptions(container, "option").some(
    (candidate) =>
      normalize(candidate.label) === normalize(value) &&
      candidate.element.getAttribute("aria-selected") === "true"
  )
}

function commitListboxValue(
  container: HTMLElement,
  value: string,
  block?: HTMLElement
) {
  const option = findAriaOption(container, "option", value)
  const hiddenInput = findAssociatedHiddenInput(container, block)
  if (!option || !hiddenInput) return false

  for (const candidate of extractAriaOptions(container, "option")) {
    const isSelected = candidate.element === option.element
    candidate.element.setAttribute(
      "aria-selected",
      isSelected ? "true" : "false"
    )
    candidate.element.setAttribute("tabindex", isSelected ? "0" : "-1")
    candidate.element.classList.toggle("KKjvXb", isSelected)
    candidate.element.classList.toggle("DEh1R", isSelected)
  }
  container.setAttribute("aria-expanded", "false")

  setControlValue(hiddenInput, option.value)
  hiddenInput.setAttribute("value", option.value)
  dispatchFormEvents(hiddenInput)

  return normalize(hiddenInput.value) === normalize(value)
}

function findAssociatedHiddenInput(
  container: HTMLElement,
  block?: HTMLElement
) {
  const scopedInput = block?.querySelector<HTMLInputElement>(
    'input[type="hidden"][name^="entry."]:not([name$="_sentinel"])'
  )
  if (scopedInput) return scopedInput

  const form = container.closest("form")
  if (!form || !block) return undefined

  const entryId = findEntryId(block)
  if (entryId) {
    const explicitInput = form.querySelector<HTMLInputElement>(
      `input[type="hidden"][name="entry.${entryId}"]`
    )
    if (explicitInput) return explicitInput
  }

  const hiddenInputs = Array.from(
    form.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name^="entry."]:not([name$="_sentinel"])'
    )
  )
  const questionBlocks = Array.from(
    form.querySelectorAll<HTMLElement>('[role="listitem"],fieldset')
  ).filter((candidate) =>
    candidate.querySelector(
      "input,textarea,select,[role='listbox'],[role='radio'],[role='checkbox']"
    )
  )
  const blockIndex = questionBlocks.indexOf(block)

  return blockIndex >= 0 && hiddenInputs.length === questionBlocks.length
    ? hiddenInputs[blockIndex]
    : undefined
}

function findEntryId(block: HTMLElement) {
  const dataParams = block
    .querySelector<HTMLElement>("[data-params]")
    ?.getAttribute("data-params")
  return dataParams?.match(/\[\[(\d+)/)?.[1]
}

function hasUsableBox(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function dispatchMouseSequence(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const clientX = rect.left + rect.width / 2
  const clientY = rect.top + rect.height / 2

  for (const type of [
    "mouseover",
    "mousemove",
    "mousedown",
    "mouseup",
    "click"
  ]) {
    element.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        button: 0,
        buttons: type === "mousedown" ? 1 : 0,
        cancelable: true,
        clientX,
        clientY,
        view: element.ownerDocument.defaultView
      })
    )
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function checkChoiceInput(control: HTMLInputElement, value?: string) {
  if (value && !choiceMatches(control, value)) {
    return false
  }

  if (!control.checked) {
    control.click()
  }
  dispatchFormEvents(control)
  return control.checked
}

function setControlValue(
  control: HTMLInputElement | HTMLTextAreaElement,
  value: string
) {
  const prototype =
    control instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set

  if (valueSetter) {
    valueSetter.call(control, value)
    return
  }

  control.value = value
}

function isFillable(target: FillTarget) {
  const control = target.control
  if (target.kind !== "native") return true
  if (
    !(
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement
    )
  ) {
    return false
  }

  if (control.disabled && !target.block) return false

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

  return candidates.some(
    (candidate) => normalize(candidate) === normalize(value)
  )
}

async function selectTallyDropdownOption(
  control: HTMLInputElement,
  value?: string
) {
  if (!value) return false

  const existingOptions = new Set(
    Array.from(control.ownerDocument.querySelectorAll(".list-item"))
  )
  control.focus()
  control.click()

  const option = (
    await waitForTallyOptions(control.ownerDocument, existingOptions)
  ).find((candidate) => normalize(candidate.textContent) === normalize(value))

  if (!option) {
    closeOpenDropdown(control)
    return false
  }

  option.click()
  dispatchFormEvents(control)

  return normalize(control.value) === normalize(value)
}

function waitForTallyOptions(doc: Document, existingOptions: Set<Element>) {
  const startedAt = Date.now()

  return new Promise<HTMLElement[]>((resolve) => {
    const poll = () => {
      const optionElements = Array.from(
        doc.querySelectorAll<HTMLElement>(".list-item")
      ).filter((option) => !existingOptions.has(option))

      if (
        optionElements.length > 0 ||
        Date.now() - startedAt >= tallyOptionWaitTimeoutMs
      ) {
        resolve(optionElements)
        return
      }

      setTimeout(poll, tallyOptionPollMs)
    }

    poll()
  })
}

function isTallyDropdownControl(control: HTMLInputElement) {
  return Boolean(
    control.closest(
      '.tally-block-dropdown,[data-block-type="DROPDOWN"],[data-sentry-component="CustomSelect"]'
    )
  )
}

function closeOpenDropdown(control: HTMLInputElement) {
  control.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape"
    })
  )
  control.blur()
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
