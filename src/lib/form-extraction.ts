import type { ExtractedField, PageContext } from "./fill-schemas"

type FrameMetadata = {
  frameId?: number
  frameUrl?: string
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

const sensitivePattern =
  /\b(password|passcode|otp|2fa|mfa|verification code|card number|credit card|cvv|cvc|expiry|ssn|social security|passport|aadhaar|pan number|government id)\b/i

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

export function extractFieldsFromDocument(
  doc: Document,
  frame: FrameMetadata = {}
): ExtractedField[] {
  const controls = Array.from(
    doc.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select"
    )
  )

  return controls.flatMap((control, index) => {
    if (!isSupportedControl(control)) return []

    const labelText = findLabelText(control)
    const ariaLabel = control.getAttribute("aria-label") ?? undefined
    const placeholder =
      "placeholder" in control ? control.placeholder || undefined : undefined
    const nearbyText = findNearbyText(control)

    if (
      isSensitiveField(
        [control.id, control.getAttribute("name"), labelText, ariaLabel, placeholder]
          .filter(Boolean)
          .join(" ")
      )
    ) {
      return []
    }

    return [
      {
        id:
          frame.frameId === undefined
            ? `field-${index}`
            : `frame-${frame.frameId}-field-${index}`,
        frameId: frame.frameId,
        frameUrl: frame.frameUrl,
        tagName: control.tagName.toLowerCase() as ExtractedField["tagName"],
        inputType:
          control instanceof HTMLInputElement ? control.type.toLowerCase() : undefined,
        labelText,
        ariaLabel,
        placeholder,
        currentValue:
          "value" in control && typeof control.value === "string"
            ? control.value
            : undefined,
        options:
          control instanceof HTMLSelectElement
            ? Array.from(control.options).map((option) => ({
                value: option.value,
                label: normalizeText(option.textContent)
              }))
            : undefined,
        nearbyText,
        required: control.required || undefined
      }
    ]
  })
}

function isSupportedControl(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (control.disabled || !isVisible(control)) return false

  if (control instanceof HTMLInputElement) {
    const inputType = control.type.toLowerCase()
    if (unsafeInputTypes.has(inputType)) return false
    return safeInputTypes.has(inputType)
  }

  return true
}

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute("aria-hidden") === "true") {
    return false
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element)
  if (!style || style.display === "none" || style.visibility === "hidden") {
    return false
  }

  return element instanceof HTMLInputElement ? element.type !== "hidden" : true
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

  const legend = element.closest("fieldset")?.querySelector("legend")
  const legendText = normalizeText(legend?.textContent)
  if (legendText) return legendText

  return undefined
}

function findNearbyText(element: HTMLElement) {
  const parentText = normalizeText(element.parentElement?.textContent)
  if (!parentText) return undefined
  return parentText.slice(0, 300)
}

function isSensitiveField(value: string) {
  return sensitivePattern.test(value)
}

function normalizeText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}
