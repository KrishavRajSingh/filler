import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

import { buildWaitlistEmail } from "~lib/waitlist-email"

const requestSchema = z.object({
  email: z.string().trim().email(),
  kind: z.enum(["beta", "pass"])
})

type WaitlistReplyResponse = { ok: true } | { ok: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WaitlistReplyResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" })
  }

  const parsed = requestSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "Enter a valid email." })
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("waitlist-reply: RESEND_API_KEY is not configured")
    return res
      .status(503)
      .json({ ok: false, error: "Email delivery is not configured yet." })
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Filler <onboarding@resend.dev>"
  const replyTo = process.env.RESEND_REPLY_TO ?? "krishavrajsingh@gmail.com"
  const { email, kind } = parsed.data
  const { subject, html, text } = buildWaitlistEmail(kind, email)

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [email], reply_to: replyTo, subject, html, text })
  })

  if (!response.ok) {
    console.error("waitlist-reply: Resend error", await response.text())
    return res
      .status(502)
      .json({ ok: false, error: "Could not send the email." })
  }

  return res.status(200).json({ ok: true })
}
