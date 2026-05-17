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
    const agent = mastra.getAgentById("fill-planner")
    const response = await agent.generate(buildPlannerPrompt(parsedRequest.data), {
      structuredOutput: {
        schema: fillResponseSchema
      }
    })

    res.status(200).json(normalizePlannerResponse(response.object))
  } catch {
    res.status(500).json({ error: "Fill planner failed" })
  }
}
