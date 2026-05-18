export type FillTargetKind =
  | "aria-checkbox-group"
  | "aria-listbox"
  | "aria-radio-group"
  | "native"

export type FillTarget = {
  block?: HTMLElement
  control: HTMLElement
  element: HTMLElement
  kind: FillTargetKind
}

const safeInputTypes = new Set([
  "",
  "text",
  "email",
  "url",
  "tel",
  "number",
  "date",
  "datetime-local",
  "month",
  "search",
  "time",
  "week",
  "checkbox",
  "radio"
])

const unsafeInputTypes = new Set([
  "hidden",
  "password",
  "file",
  "submit",
  "reset",
  "button",
  "image"
])

export function collectFillTargets(doc: Document): FillTarget[] {
  const targets: FillTarget[] = []

  for (const control of Array.from(
    doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select"
    )
  )) {
    if (!isSupportedNativeControl(control)) continue

    const block = findQuestionBlock(control)
    if (!block && !control.closest("form,label")) continue

    targets.push({
      block,
      control,
      element: control,
      kind: "native"
    })
  }

  for (const listbox of Array.from(
    doc.querySelectorAll<HTMLElement>('[role="listbox"]')
  )) {
    if (!isVisible(listbox) || !extractAriaOptions(listbox, "option").length) continue

    targets.push({
      block: findQuestionBlock(listbox),
      control: listbox,
      element: listbox,
      kind: "aria-listbox"
    })
  }

  targets.push(...collectAriaChoiceGroups(doc, "radio", "aria-radio-group"))
  targets.push(...collectAriaChoiceGroups(doc, "checkbox", "aria-checkbox-group"))

  return targets.sort(compareTargetsByDocumentOrder)
}

export function isSupportedNativeControl(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (!isVisible(control)) return false

  const block = findQuestionBlock(control)
  if (control.disabled && !block) return false

  if (control instanceof HTMLInputElement) {
    const inputType = control.type.toLowerCase()
    if (unsafeInputTypes.has(inputType)) return false
    return safeInputTypes.has(inputType)
  }

  return true
}

export function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute("aria-hidden") === "true") {
    return false
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element)
  if (!style || style.display === "none" || style.visibility === "hidden") {
    return false
  }

  return element instanceof HTMLInputElement ? element.type !== "hidden" : true
}

export function findQuestionBlock(element: HTMLElement) {
  const directBlock = element.closest<HTMLElement>(
    'fieldset,[role="listitem"],[role="group"],li'
  )
  if (directBlock) return directBlock

  let ancestor = element.parentElement
  let depth = 0

  while (ancestor && depth < 4) {
    if (ancestor.tagName === "FORM" || ancestor === element.ownerDocument.body) {
      return undefined
    }

    const text = normalizeText(ancestor.textContent)
    if (text && text !== "Open" && text !== "Start typing...") {
      return ancestor
    }

    ancestor = ancestor.parentElement
    depth += 1
  }

  return undefined
}

export function extractAriaOptions(container: Element, role: "checkbox" | "option" | "radio") {
  return Array.from(container.querySelectorAll<HTMLElement>(`[role="${role}"]`))
    .filter(isVisible)
    .map((option) => {
      const label = normalizeText(option.getAttribute("aria-label") ?? option.textContent)
      return label ? { element: option, label, value: label } : undefined
    })
    .filter((option): option is { element: HTMLElement; label: string; value: string } =>
      Boolean(option)
    )
}

function collectAriaChoiceGroups(
  doc: Document,
  role: "checkbox" | "radio",
  kind: Extract<FillTargetKind, "aria-checkbox-group" | "aria-radio-group">
) {
  const groups: FillTarget[] = []
  const seenBlocks = new Set<HTMLElement>()

  for (const choice of Array.from(doc.querySelectorAll<HTMLElement>(`[role="${role}"]`))) {
    if (!isVisible(choice)) continue

    const block = findQuestionBlock(choice) ?? choice.parentElement
    if (!block || seenBlocks.has(block)) continue

    const options = extractAriaOptions(block, role)
    if (options.length === 0) continue

    seenBlocks.add(block)
    groups.push({
      block,
      control: choice,
      element: block,
      kind
    })
  }

  return groups
}

function compareTargetsByDocumentOrder(first: FillTarget, second: FillTarget) {
  if (first.element === second.element) return 0

  const position = first.element.compareDocumentPosition(second.element)
  return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}
