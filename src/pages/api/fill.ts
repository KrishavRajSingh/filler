import type { NextApiRequest, NextApiResponse } from "next"

import {
  fillRequestSchema,
  fillResponseSchema,
  type FillRequest,
  type FillResponse
} from "~lib/fill-schemas"
import { mastra } from "~mastra"

type FillApiError = {
  error: string
}

export function buildPlannerPrompt(request: FillRequest) {
  return `
Fill the visible form fields using the user's local profile.

Draft reviewable answers for application-style questions when the supplied profile
contains enough signal for a reasonable answer. Use medium confidence for inferred
or drafted answers that the user should review before submitting. Only skip fields
that are unsafe, require manual action, or cannot be answered from the supplied
profile and page context.

For preference-style questions, salary expectations, and "Where did you hear"
questions, prefer a concise reviewable draft over skipping when the profile has
directional signal. For salary expectations without an exact number, draft a
flexible answer such as open to discussing a market-competitive USD range rather
than inventing a specific salary. For work-style preferences, infer cautiously
from startup/founder/role context and use medium confidence.

For education fields, match the requested attribute precisely. If a field asks
what year the user graduated from university/college, use the graduation year,
not the school or university name. Only use the school/university name when the
field asks for the institution, school, college, or university name.

Page:
${JSON.stringify(request.page, null, 2)}

Profile:
${JSON.stringify(request.profile, null, 2)}

Fields:
${JSON.stringify(request.fields, null, 2)}
`
}

export function normalizePlannerResponse(value: unknown): FillResponse {
  const parsed = fillResponseSchema.safeParse(value)
  return parsed.success ? parsed.data : { fields: [] }
}

function logFillDebug(request: FillRequest, response?: FillResponse) {
  if (process.env.NODE_ENV === "production") return

  console.info(
    "[filler] fill request fields",
    request.fields.map((field) => ({
      id: field.id,
      inputType: field.inputType,
      labelText: field.labelText,
      nearbyText: field.nearbyText,
      options: field.options?.map((option) => option.label),
      tagName: field.tagName
    }))
  )

  if (response) {
    console.info(
      "[filler] fill planner instructions",
      response.fields.map((field) => ({
        action: field.action,
        confidence: field.confidence,
        fieldId: field.fieldId,
        reason: field.reason,
        value: field.value
      }))
    )
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FillResponse | FillApiError>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const parsedRequest = fillRequestSchema.safeParse(req.body)
  if (!parsedRequest.success) {
    res.status(400).json({ error: "Invalid fill request" })
    return
  }

  try {
    logFillDebug(parsedRequest.data)

    const agent = mastra.getAgentById("fill-planner")
    const response = await agent.generate(buildPlannerPrompt(parsedRequest.data), {
      structuredOutput: {
        schema: fillResponseSchema
      }
    })

    const normalizedResponse = normalizePlannerResponse(response.object)
    logFillDebug(parsedRequest.data, normalizedResponse)
    res.status(200).json(normalizedResponse)
  } catch (error) {
    console.error("[filler] fill planner failed", error)
    res.status(500).json({ error: "Fill planner failed" })
  }
}
