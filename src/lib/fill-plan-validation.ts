import type { FillInstruction } from "./fill-schemas"

export function validateFillInstructions(
  response: unknown,
  knownFieldIds: Set<string>
): FillInstruction[] {
  if (!isFillResponseLike(response)) return []

  return response.fields.flatMap((instruction) => {
    if (!knownFieldIds.has(instruction.fieldId)) return []

    if (instruction.confidence === "low") {
      return [
        {
          action: "skip",
          confidence: "low",
          fieldId: instruction.fieldId,
          reason: "Low confidence"
        } satisfies FillInstruction
      ]
    }

    return [instruction]
  })
}

function isFillResponseLike(
  value: unknown
): value is { fields: FillInstruction[] } {
  if (!value || typeof value !== "object" || !("fields" in value)) {
    return false
  }

  const fields = (value as { fields: unknown }).fields
  if (!Array.isArray(fields)) return false

  return fields.every(isFillInstructionLike)
}

function isFillInstructionLike(value: unknown): value is FillInstruction {
  if (!value || typeof value !== "object") return false

  const candidate = value as {
    action?: unknown
    confidence?: unknown
    fieldId?: unknown
    reason?: unknown
    value?: unknown
  }

  return (
    typeof candidate.fieldId === "string" &&
    isFillAction(candidate.action) &&
    isConfidence(candidate.confidence) &&
    (candidate.value === undefined || typeof candidate.value === "string") &&
    (candidate.reason === undefined || typeof candidate.reason === "string")
  )
}

function isFillAction(value: unknown): value is FillInstruction["action"] {
  return (
    value === "setValue" ||
    value === "selectOption" ||
    value === "check" ||
    value === "skip"
  )
}

function isConfidence(value: unknown): value is FillInstruction["confidence"] {
  return value === "high" || value === "medium" || value === "low"
}
