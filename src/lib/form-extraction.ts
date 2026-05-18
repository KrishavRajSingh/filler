import type { ExtractedField, PageContext } from "./fill-schemas"
import {
  collectFillTargets,
  extractAriaOptions,
  findQuestionBlock,
  type FillTarget
} from "./form-targets"

type FrameMetadata = {
  frameId?: number
  frameUrl?: string
}

const sensitivePattern =
  /\b(password|passcode|otp|2fa|mfa|verification code|card number|credit card|cvv|cvc|expiry|ssn|social security|passport|aadhaar|pan number|government id)\b/i
const tallyOptionWaitTimeoutMs = 750
const tallyOptionPollMs = 25

export function extractPageContext(
  doc: Document,
  url = doc.location?.href ?? ""
): PageContext {
  return {
    title: doc.title ?? "",
    url,
    headings: Array.from(doc.querySelectorAll("h1,h2,h3"))
      .map((heading) => normalizeText(heading.textContent))
      .filter(Boolean)
      .slice(0, 12)
  }
}

export async function extractFieldsFromDocument(
  doc: Document,
  frame: FrameMetadata = {}
): Promise<ExtractedField[]> {
  const targets = collectFillTargets(doc)
  const fields: ExtractedField[] = []

  for (const [index, target] of targets.entries()) {
    const control = target.control
    const rawLabelText = findLabelText(control) ?? findTallyQuestionText(control)
    const labelText = cleanRequiredMarker(rawLabelText)
    const ariaLabel = control.getAttribute("aria-label") ?? undefined
    const placeholder =
      control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
        ? control.placeholder || undefined
        : undefined
    const nearbyText = findTallyNearbyText(control, labelText) ?? findNearbyText(control)

    if (
      isSensitiveField(
        [control.id, control.getAttribute("name"), labelText, ariaLabel, placeholder]
          .filter(Boolean)
          .join(" ")
      )
    ) {
      continue
    }

    fields.push({
      id:
        frame.frameId === undefined
          ? `field-${index}`
          : `frame-${frame.frameId}-field-${index}`,
      frameId: frame.frameId,
      frameUrl: frame.frameUrl,
      tagName: control.tagName.toLowerCase() as ExtractedField["tagName"],
      controlKind: target.kind,
      inputType:
        control instanceof HTMLInputElement ? control.type.toLowerCase() : undefined,
      role: control.getAttribute("role") ?? undefined,
      labelText,
      ariaLabel,
      placeholder,
      currentValue:
        "value" in control && typeof control.value === "string"
          ? control.value
          : undefined,
      options: await extractOptions(target),
      nearbyText,
      required:
        isRequiredNativeControl(control) ||
        hasRequiredMarker(rawLabelText) ||
        isRequiredField(control, rawLabelText) ||
        undefined
    })
  }

  return fields
}

function findLabelText(element: HTMLElement) {
  if (element.id) {
    const label = element.ownerDocument.querySelector(
      `label[for="${CSS.escape(element.id)}"]`
    )
    const text = normalizeText(label?.textContent)
    if (text) return text
  }

  const wrappingLabel = element.closest("label")
  const wrappingText = normalizeText(wrappingLabel?.textContent)
  if (wrappingText) return wrappingText

  const fieldsetQuestionText = findFieldsetQuestionLabelText(element)
  if (fieldsetQuestionText) return fieldsetQuestionText

  const legend = element.closest("fieldset")?.querySelector("legend")
  const legendText = normalizeText(legend?.textContent)
  if (legendText) return legendText

  const questionHeadingText = findQuestionHeadingText(element)
  if (questionHeadingText) return questionHeadingText

  const ancestorPrompt = findAncestorPromptText(element)
  if (ancestorPrompt) return ancestorPrompt

  return undefined
}

function findFieldsetQuestionLabelText(element: HTMLElement) {
  if (isChoiceInput(element)) return undefined

  const questionLabel = element
    .closest("fieldset")
    ?.querySelector<HTMLElement>("label.ashby-application-form-question-title")

  return normalizeText(questionLabel?.textContent)
}

function isChoiceInput(element: HTMLElement) {
  return (
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio")
  )
}

function isRequiredField(element: HTMLElement, labelText?: string) {
  if (element.getAttribute("aria-required") === "true") return true
  if (hasRequiredMarker(labelText)) return true
  if (hasRequiredMarker(findFieldContextText(element))) return true

  const questionLabel = element
    .closest("fieldset")
    ?.querySelector<HTMLElement>("label.ashby-application-form-question-title")

  return Boolean(
    questionLabel?.getAttribute("aria-required") === "true" ||
      Array.from(questionLabel?.classList ?? []).some((className) =>
        className.toLowerCase().includes("required")
      )
  )
}

function findQuestionHeadingText(element: HTMLElement) {
  const contextElement = findFieldContextElement(element)
  const heading = contextElement?.querySelector<HTMLElement>(
    '[role="heading"],legend,label'
  )

  if (!heading || heading.contains(element)) return undefined
  return normalizeText(heading.textContent)
}

function isRequiredNativeControl(element: HTMLElement) {
  return (
    (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement) &&
    element.required
  )
}

function hasRequiredMarker(value?: string) {
  return Boolean(value && /(?:^|\s)\*(?:\s|$)/.test(value))
}

function cleanRequiredMarker(value?: string) {
  return value?.replace(/\s+\*$/, "").trim()
}

function findNearbyText(element: HTMLElement) {
  const contextText = findFieldContextText(element)
  if (contextText) return contextText.slice(0, 600)

  const parentText = normalizeReadableText(element.parentElement)
  if (!parentText) return undefined
  return parentText.slice(0, 600)
}

async function extractOptions(target: FillTarget) {
  const control = target.control

  if (target.kind === "aria-listbox") {
    const options = extractAriaOptions(control, "option")
      .map((option) => ({ label: option.label, value: option.value }))
      .filter((option) => normalizeText(option.label).toLowerCase() !== "choose")

    return options.length > 0 ? options : undefined
  }

  if (target.kind === "aria-radio-group") {
    const block = target.block ?? target.element
    const options = extractAriaOptions(block, "radio").map((option) => ({
      label: option.label,
      value: option.value
    }))

    return options.length > 0 ? options : undefined
  }

  if (target.kind === "aria-checkbox-group") {
    const block = target.block ?? target.element
    const options = extractAriaOptions(block, "checkbox").map((option) => ({
      label: option.label,
      value: option.value
    }))

    return options.length > 0 ? options : undefined
  }

  if (control instanceof HTMLSelectElement) {
    return Array.from(control.options).map((option) => ({
      value: option.value,
      label: normalizeText(option.textContent)
    }))
  }

  if (control instanceof HTMLInputElement && isTallyDropdownControl(control)) {
    return await extractTallyDropdownOptions(control)
  }

  return undefined
}

function isTallyDropdownControl(control: HTMLInputElement) {
  return Boolean(
    control.closest(
      '.tally-block-dropdown,[data-block-type="DROPDOWN"],[data-sentry-component="CustomSelect"]'
    )
  )
}

async function extractTallyDropdownOptions(control: HTMLInputElement) {
  const existingOptions = new Set(
    Array.from(control.ownerDocument.querySelectorAll(".list-item"))
  )
  control.focus()
  control.click()

  const optionElements = await waitForTallyOptions(control.ownerDocument, existingOptions)

  closeOpenDropdown(control)

  const options = optionElements
    .map((option) => normalizeText(option.textContent))
    .filter(Boolean)
    .map((label) => ({ label, value: label }))

  return options.length > 0 ? options : undefined
}

function waitForTallyOptions(doc: Document, existingOptions: Set<Element>) {
  const startedAt = Date.now()

  return new Promise<HTMLElement[]>((resolve) => {
    const poll = () => {
      const optionElements = Array.from(
        doc.querySelectorAll<HTMLElement>(".list-item")
      ).filter((option) => !existingOptions.has(option))

      if (optionElements.length > 0 || Date.now() - startedAt >= tallyOptionWaitTimeoutMs) {
        resolve(optionElements)
        return
      }

      setTimeout(poll, tallyOptionPollMs)
    }

    poll()
  })
}

function closeOpenDropdown(control: HTMLInputElement) {
  control.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" })
  )
  control.blur()
}

function findTallyNearbyText(element: HTMLElement, labelText?: string) {
  const question = findTallyQuestionText(element)
  if (!question) return undefined

  if (element instanceof HTMLInputElement && element.type === "radio") {
    const optionText = labelText ?? findLabelText(element)
    return normalizeText([question, optionText].filter(Boolean).join(" "))
  }

  return undefined
}

function findTallyQuestionText(element: HTMLElement) {
  const describedBy = element.getAttribute("aria-describedby")
  if (describedBy) {
    const describedText = describedBy
      .split(/\s+/)
      .map((id) =>
        normalizeText(element.ownerDocument.getElementById(id)?.textContent)
      )
      .find(Boolean)
    if (describedText) return describedText
  }

  const block = element.closest<HTMLElement>(".tally-block,[data-block-type]")
  for (
    let sibling = block?.previousElementSibling;
    sibling;
    sibling = sibling.previousElementSibling
  ) {
    if (!(sibling instanceof HTMLElement)) continue

    if (sibling.getAttribute("data-block-type") === "TITLE") {
      return normalizeText(
        sibling.querySelector("h1,h2,h3")?.textContent ?? sibling.textContent
      )
    }
  }

  return undefined
}

function findAncestorPromptText(element: HTMLElement) {
  const contextElement = findFieldContextElement(element)
  if (!contextElement) return undefined

  return (
    findPreControlText(contextElement, element) ??
    firstUsefulLine(findFieldContextText(element))
  )
}

function findFieldContextText(element: HTMLElement) {
  const contextElement = findFieldContextElement(element)
  return normalizeReadableText(contextElement)
}

function findFieldContextElement(element: HTMLElement) {
  return findQuestionBlock(element)
}

function findPreControlText(container: HTMLElement, control: HTMLElement) {
  const textParts: string[] = []

  for (const child of Array.from(container.children)) {
    if (child.contains(control)) break

    const text = normalizeReadableText(child)
    if (text) textParts.push(text)
  }

  return firstUsefulLine(textParts.join(" "))
}

function firstUsefulLine(value?: string) {
  const normalized = normalizeText(value)
  if (!normalized) return undefined

  const firstQuestion = normalized.match(/^(.+?\?[*]?)(?:\s|$)/)
  if (firstQuestion?.[1]) return firstQuestion[1]

  const firstSentence = normalized.match(/^(.+?[*]?)(?:\s{2,}|$)/)
  return firstSentence?.[1] ?? normalized
}

function isSensitiveField(value: string) {
  return sensitivePattern.test(value)
}

function normalizeReadableText(element?: Element | null) {
  if (!element) return ""

  const clone = element.cloneNode(true)
  if (clone instanceof Element) {
    clone.querySelectorAll("button,svg").forEach((child) => child.remove())
  }

  const text =
    clone instanceof HTMLElement && "innerText" in clone
      ? clone.innerText
      : clone.textContent

  return normalizeText(text)
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}
