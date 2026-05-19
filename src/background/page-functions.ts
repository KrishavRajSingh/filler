import type { ExtractedField, FillInstruction, PageContext } from "~lib/fill-schemas"

type ExtractFieldsResponse = {
  fields: ExtractedField[]
  frameId?: number
  frameUrl?: string
  ok: true
  page: PageContext
}

type ApplyFillResponse = {
  filled: number
  ok: true
  skipped: number
}

export async function collectFieldsInPage(
  frameId?: number,
  frameUrl = window.location.href
): Promise<ExtractFieldsResponse> {
  const safeInputTypes = [
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
  ]
  const unsafeInputTypes = [
    "hidden",
    "password",
    "file",
    "submit",
    "reset",
    "button",
    "image"
  ]
  const sensitivePattern =
    /\b(password|passcode|otp|2fa|mfa|verification code|card number|credit card|cvv|cvc|expiry|ssn|social security|passport|aadhaar|pan number|government id)\b/i
  const tallyOptionWaitTimeoutMs = 750
  const tallyOptionPollMs = 25

  function normalizeText(value?: string | null) {
    return value?.replace(/\s+/g, " ").trim() ?? ""
  }

  function cleanRequiredMarker(value?: string) {
    return value?.replace(/\s+\*$/, "").trim()
  }

  function hasRequiredMarker(value?: string) {
    return Boolean(value && /(?:^|\s)\*(?:\s|$)/.test(value))
  }

  function isVisible(element: HTMLElement) {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") return false
    const style = element.ownerDocument.defaultView?.getComputedStyle(element)
    if (!style || style.display === "none" || style.visibility === "hidden") {
      return false
    }
    return element instanceof HTMLInputElement ? element.type !== "hidden" : true
  }

  function isSupportedControl(
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) {
    if (!isVisible(control)) return false
    if (control.disabled) return false
    if (control instanceof HTMLInputElement) {
      const type = control.type.toLowerCase()
      return safeInputTypes.includes(type) && !unsafeInputTypes.includes(type)
    }
    return true
  }

  function findLabelText(element: HTMLElement) {
    if (element.id) {
      const label = element.ownerDocument.querySelector(
        `label[for="${CSS.escape(element.id)}"]`
      )
      const text = normalizeText(label?.textContent)
      if (text) return text
    }

    const wrappingText = normalizeText(element.closest("label")?.textContent)
    if (wrappingText) return wrappingText

    const describedBy = element.getAttribute("aria-describedby")
    if (describedBy) {
      const describedText = describedBy
        .split(/\s+/)
        .map((id) => normalizeText(element.ownerDocument.getElementById(id)?.textContent))
        .find(Boolean)
      if (describedText) return describedText
    }

    const previousLabel = element.previousElementSibling
    if (previousLabel) {
      const text = normalizeText(previousLabel.textContent)
      if (text) return text
    }

    return findTallyQuestionText(element)
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

  function closeOpenDropdown(control: HTMLInputElement) {
    control.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" })
    )
    control.blur()
  }

  function findTallyQuestionText(element: HTMLElement) {
    const describedBy = element.getAttribute("aria-describedby")
    if (describedBy) {
      const describedText = describedBy
        .split(/\s+/)
        .map((id) => normalizeText(element.ownerDocument.getElementById(id)?.textContent))
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

  function findNearbyText(element: HTMLElement) {
    const tallyNearbyText = findTallyNearbyText(element)
    if (tallyNearbyText) return tallyNearbyText

    let ancestor = element.parentElement
    let depth = 0
    while (ancestor && depth < 4 && ancestor !== element.ownerDocument.body) {
      const text = normalizeText(ancestor.textContent)
      if (text) return text.slice(0, 600)
      ancestor = ancestor.parentElement
      depth += 1
    }
    return undefined
  }

  function findTallyNearbyText(element: HTMLElement) {
    if (!(element instanceof HTMLInputElement)) return undefined
    if (element.type !== "radio" && element.type !== "checkbox") return undefined

    const question = findTallyQuestionText(element)
    if (!question) return undefined

    const optionText = findLabelText(element)
    return normalizeText([question, optionText].filter(Boolean).join(" "))
  }

  function findQuestionBlock(element: HTMLElement) {
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

  function findQuestionHeadingText(element: HTMLElement) {
    const block = findQuestionBlock(element)
    const heading = block?.querySelector<HTMLElement>('[role="heading"],legend,label')
    if (!heading || heading.contains(element)) return undefined
    return normalizeText(heading.textContent)
  }

  function findSemanticQuestionText(element: HTMLElement, control = element) {
    return (
      findQuestionHeadingText(element) ??
      findPreControlText(findQuestionBlock(element), control) ??
      firstUsefulLine(normalizeReadableText(findQuestionBlock(element)))
    )
  }

  function findPreControlText(container: HTMLElement | undefined, control: HTMLElement) {
    if (!container) return undefined

    const textParts: string[] = []
    for (const child of Array.from(container.children)) {
      if (child.contains(control)) break

      const text = normalizeReadableText(child)
      if (text) textParts.push(text)
    }

    return normalizeText(textParts.join(" "))
  }

  function firstUsefulLine(value?: string) {
    return value
      ?.split(/\s{2,}|\n/)
      .map((line) => normalizeText(line))
      .find(Boolean)
  }

  function normalizeReadableText(element?: Element | null) {
    if (!element) return undefined
    const clone = element.cloneNode(true)
    if (!(clone instanceof HTMLElement)) return normalizeText(element.textContent)
    clone.querySelectorAll("input,textarea,select,button").forEach((node) => node.remove())
    return normalizeText(clone.textContent)
  }

  function extractAriaOptions(container: Element, role: "checkbox" | "option" | "radio") {
    return Array.from(container.querySelectorAll<HTMLElement>(`[role="${role}"]`))
      .filter(isVisible)
      .map((option) => {
        const label = normalizeText(option.getAttribute("aria-label") ?? option.textContent)
        return label ? { element: option, label, value: label } : undefined
      })
      .filter(
        (option): option is { element: HTMLElement; label: string; value: string } =>
          Boolean(option)
      )
  }

  function collectAriaChoiceGroups(
    role: "checkbox" | "radio",
    kind: "aria-checkbox-group" | "aria-radio-group"
  ) {
    const groups: {
      block?: HTMLElement
      control: HTMLElement
      element: HTMLElement
      kind: "aria-checkbox-group" | "aria-radio-group"
    }[] = []
    const seenBlocks = new Set<HTMLElement>()

    for (const choice of Array.from(document.querySelectorAll<HTMLElement>(`[role="${role}"]`))) {
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

  const targets: {
    block?: HTMLElement
    control: HTMLElement
    element: HTMLElement
    kind: "aria-checkbox-group" | "aria-listbox" | "aria-radio-group" | "native"
  }[] = []

  for (const control of Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select"
    )
  )) {
    if (!isSupportedControl(control)) continue

    targets.push({
      block: findQuestionBlock(control),
      control,
      element: control,
      kind: "native"
    })
  }

  for (const listbox of Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"]'))) {
    if (!isVisible(listbox) || !extractAriaOptions(listbox, "option").length) continue

    targets.push({
      block: findQuestionBlock(listbox),
      control: listbox,
      element: listbox,
      kind: "aria-listbox"
    })
  }

  targets.push(...collectAriaChoiceGroups("radio", "aria-radio-group"))
  targets.push(...collectAriaChoiceGroups("checkbox", "aria-checkbox-group"))
  targets.sort((first, second) => {
    if (first.element === second.element) return 0
    const position = first.element.compareDocumentPosition(second.element)
    return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1
  })

  const fields: ExtractedField[] = []

  for (const [index, target] of targets.entries()) {
    const control = target.control
    const rawLabelText =
      target.kind === "native"
        ? findLabelText(control) ?? findSemanticQuestionText(control)
        : findSemanticQuestionText(target.block ?? target.element, control)
    const labelText = cleanRequiredMarker(rawLabelText)
    const ariaLabel = control.getAttribute("aria-label") ?? undefined
    const placeholder =
      control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
        ? control.placeholder || undefined
        : undefined

    const options =
      target.kind === "aria-listbox"
        ? extractAriaOptions(control, "option")
            .map((option) => ({ label: option.label, value: option.value }))
            .filter((option) => normalizeText(option.label).toLowerCase() !== "choose")
        : target.kind === "aria-radio-group"
          ? extractAriaOptions(target.block ?? target.element, "radio").map((option) => ({
              label: option.label,
              value: option.value
            }))
          : target.kind === "aria-checkbox-group"
            ? extractAriaOptions(target.block ?? target.element, "checkbox").map((option) => ({
                label: option.label,
                value: option.value
              }))
            : control instanceof HTMLSelectElement
              ? Array.from(control.options).map((option) => ({
                  label: normalizeText(option.textContent),
                  value: option.value
                }))
              : control instanceof HTMLInputElement && isTallyDropdownControl(control)
                ? await extractTallyDropdownOptions(control)
                : undefined

    const identifyingText = [
      control.id,
      control.getAttribute("name"),
      labelText,
      ariaLabel,
      placeholder
    ]
      .filter(Boolean)
      .join(" ")

    if (sensitivePattern.test(identifyingText)) continue

    fields.push({
      ariaLabel,
      controlKind: target.kind,
      currentValue:
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement
          ? control.value
          : undefined,
      frameId,
      frameUrl,
      id: frameId === undefined ? `field-${index}` : `frame-${frameId}-field-${index}`,
      inputType:
        control instanceof HTMLInputElement ? control.type.toLowerCase() : undefined,
      labelText,
      nearbyText: findNearbyText(control),
      options: options && options.length > 0 ? options : undefined,
      placeholder,
      required:
        hasRequiredMarker(rawLabelText) ||
        ((control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement) &&
        control.required)
          ? true
          : undefined,
      role: control.getAttribute("role") ?? undefined,
      tagName: control.tagName.toLowerCase() as "div" | "input" | "select" | "textarea"
    })
  }

  return {
    fields,
    frameId,
    frameUrl,
    ok: true,
    page: {
      headings: Array.from(document.querySelectorAll("h1,h2,h3"))
        .map((heading) => normalizeText(heading.textContent))
        .filter(Boolean)
        .slice(0, 12),
      title: document.title ?? "",
      url: frameUrl
    }
  }
}

export async function applyInstructionsInPage(
  instructions: FillInstruction[]
): Promise<ApplyFillResponse> {
  const safeInputTypes = [
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
  ]
  const unsafeInputTypes = [
    "hidden",
    "password",
    "file",
    "submit",
    "reset",
    "button",
    "image"
  ]
  const tallyOptionWaitTimeoutMs = 750
  const tallyOptionPollMs = 25

  function normalize(value?: string | null) {
    return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? ""
  }

  function normalizeText(value?: string | null) {
    return value?.replace(/\s+/g, " ").trim() ?? ""
  }

  function isVisible(element: HTMLElement) {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") return false
    const style = element.ownerDocument.defaultView?.getComputedStyle(element)
    return Boolean(style && style.display !== "none" && style.visibility !== "hidden")
  }

  function isSupportedControl(
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) {
    if (!isVisible(control) || control.disabled) return false
    if (control instanceof HTMLInputElement) {
      const type = control.type.toLowerCase()
      return safeInputTypes.includes(type) && !unsafeInputTypes.includes(type)
    }
    return true
  }

  function setControlValue(control: HTMLInputElement | HTMLTextAreaElement, value: string) {
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

  function dispatchFormEvents(element: HTMLElement) {
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(new Event("change", { bubbles: true }))
  }

  function extractAriaOptions(container: Element, role: "checkbox" | "option" | "radio") {
    return Array.from(container.querySelectorAll<HTMLElement>(`[role="${role}"]`))
      .filter(isVisible)
      .map((option) => {
        const label = normalizeText(option.getAttribute("aria-label") ?? option.textContent)
        return label ? { element: option, label, value: label } : undefined
      })
      .filter(
        (option): option is { element: HTMLElement; label: string; value: string } =>
          Boolean(option)
      )
  }

  function findQuestionBlock(element: HTMLElement) {
    return element.closest<HTMLElement>('fieldset,[role="listitem"],[role="group"],li')
  }

  function collectTargets() {
    const targets: {
      block?: HTMLElement
      control: HTMLElement
      element: HTMLElement
      kind: "aria-checkbox-group" | "aria-listbox" | "aria-radio-group" | "native"
    }[] = []

    for (const control of Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input, textarea, select"
      )
    )) {
      if (!isSupportedControl(control)) continue
      targets.push({
        block: findQuestionBlock(control),
        control,
        element: control,
        kind: "native"
      })
    }

    for (const listbox of Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"]'))) {
      if (!isVisible(listbox) || !extractAriaOptions(listbox, "option").length) continue
      targets.push({
        block: findQuestionBlock(listbox),
        control: listbox,
        element: listbox,
        kind: "aria-listbox"
      })
    }

    const seenBlocks = new Set<HTMLElement>()
    for (const role of ["radio", "checkbox"] as const) {
      for (const choice of Array.from(document.querySelectorAll<HTMLElement>(`[role="${role}"]`))) {
        if (!isVisible(choice)) continue
        const block = findQuestionBlock(choice) ?? choice.parentElement
        if (!block || seenBlocks.has(block)) continue
        if (!extractAriaOptions(block, role).length) continue
        seenBlocks.add(block)
        targets.push({
          block,
          control: choice,
          element: block,
          kind: role === "radio" ? "aria-radio-group" : "aria-checkbox-group"
        })
      }
    }

    return targets.sort((first, second) => {
      if (first.element === second.element) return 0
      const position = first.element.compareDocumentPosition(second.element)
      return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1
    })
  }

  function isTallyDropdownControl(control: HTMLInputElement) {
    return Boolean(
      control.closest(
        '.tally-block-dropdown,[data-block-type="DROPDOWN"],[data-sentry-component="CustomSelect"]'
      )
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

  const targets = collectTargets()

  let filled = 0
  let skipped = 0

  for (const instruction of instructions) {
    if (instruction.confidence === "low" || instruction.action === "skip") {
      skipped += 1
      continue
    }

    const index = Number(instruction.fieldId.match(/field-(\d+)$/)?.[1] ?? -1)
    const target = targets[index]
    if (!target) {
      skipped += 1
      continue
    }
    const control = target.control

    if (
      instruction.action === "setValue" &&
      (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)
    ) {
      if (control instanceof HTMLInputElement && ["checkbox", "radio"].includes(control.type)) {
        skipped += 1
        continue
      }
      setControlValue(control, instruction.value ?? "")
      dispatchFormEvents(control)
      filled += 1
      continue
    }

    if (instruction.action === "selectOption" && control instanceof HTMLSelectElement) {
      const option = Array.from(control.options).find(
        (candidate) =>
          normalize(candidate.label) === normalize(instruction.value) ||
          normalize(candidate.value) === normalize(instruction.value)
      )
      if (!option) {
        skipped += 1
        continue
      }
      control.value = option.value
      dispatchFormEvents(control)
      filled += 1
      continue
    }

    if (
      instruction.action === "selectOption" &&
      control instanceof HTMLInputElement &&
      isTallyDropdownControl(control)
    ) {
      const didSelect = await selectTallyDropdownOption(control, instruction.value)
      filled += didSelect ? 1 : 0
      skipped += didSelect ? 0 : 1
      continue
    }

    if (instruction.action === "selectOption" && target.kind === "aria-listbox") {
      const didSelect = selectAriaOption(control, "option", instruction.value, target.block)
      filled += didSelect ? 1 : 0
      skipped += didSelect ? 0 : 1
      continue
    }

    if (
      (instruction.action === "selectOption" ||
        (instruction.action === "check" && target.kind === "aria-checkbox-group")) &&
      (target.kind === "aria-radio-group" || target.kind === "aria-checkbox-group")
    ) {
      const didSelect = selectAriaOption(
        target.block ?? target.element,
        target.kind === "aria-radio-group" ? "radio" : "checkbox",
        instruction.value
      )
      filled += didSelect ? 1 : 0
      skipped += didSelect ? 0 : 1
      continue
    }

    if (instruction.action === "check" && control instanceof HTMLInputElement) {
      if (!["checkbox", "radio"].includes(control.type)) {
        skipped += 1
        continue
      }
      if (!control.checked) control.click()
      dispatchFormEvents(control)
      filled += control.checked ? 1 : 0
      skipped += control.checked ? 0 : 1
      continue
    }

    skipped += 1
  }

  return { filled, ok: true, skipped }

  function selectAriaOption(
    container: HTMLElement,
    role: "checkbox" | "option" | "radio",
    value?: string,
    block?: HTMLElement
  ) {
    if (!value) return false
    const option = extractAriaOptions(container, role).find(
      (candidate) => normalize(candidate.label) === normalize(value)
    )
    if (!option) return false

    if (role === "option") {
      if (commitListboxValue(container, option, block)) return true
    }

    option.element.click()
    dispatchFormEvents(option.element)

    if (role === "option") {
      container.setAttribute("aria-expanded", "false")
      return (
        option.element.getAttribute("aria-selected") === "true" ||
        commitListboxValue(container, option, block)
      )
    }

    return option.element.getAttribute("aria-checked") === "true"
  }

  function commitListboxValue(
    container: HTMLElement,
    option: { element: HTMLElement; value: string },
    block?: HTMLElement
  ) {
    const hiddenInput = findAssociatedHiddenInput(container, block)
    if (!hiddenInput) return false

    for (const candidate of extractAriaOptions(container, "option")) {
      const isSelected = candidate.element === option.element
      candidate.element.setAttribute("aria-selected", isSelected ? "true" : "false")
      candidate.element.setAttribute("tabindex", isSelected ? "0" : "-1")
      candidate.element.classList.toggle("KKjvXb", isSelected)
      candidate.element.classList.toggle("DEh1R", isSelected)
    }

    container.setAttribute("aria-expanded", "false")
    setControlValue(hiddenInput, option.value)
    hiddenInput.setAttribute("value", option.value)
    dispatchFormEvents(hiddenInput)

    return normalize(hiddenInput.value) === normalize(option.value)
  }

  function findAssociatedHiddenInput(container: HTMLElement, block?: HTMLElement) {
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
      candidate.querySelector("input,textarea,select,[role='listbox'],[role='radio'],[role='checkbox']")
    )
    const blockIndex = questionBlocks.indexOf(block)

    return blockIndex >= 0 && hiddenInputs.length === questionBlocks.length
      ? hiddenInputs[blockIndex]
      : hiddenInputs[0]
  }

  function findEntryId(block: HTMLElement) {
    const dataParams = block.querySelector("[data-params]")?.getAttribute("data-params")
    return dataParams?.match(/\[\[(\d+)/)?.[1]
  }
}
