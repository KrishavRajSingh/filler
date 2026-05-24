import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

import {
  buildInstallLinkEmailHtml,
  buildInstallLinkEmailText
} from "~lib/install-link-email"

const requestSchema = z.object({
  email: z.string().trim().email()
})

type SendInstallLinkResponse =
  | { ok: true }
  | { ok: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendInstallLinkResponse>
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
    console.warn("send-install-link: RESEND_API_KEY is not configured")
    return res.status(503).json({
      ok: false,
      error: "Email delivery is not configured yet."
    })
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Filler <onboarding@resend.dev>"
  const { email } = parsed.data

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Install Filler on your computer",
      html: buildInstallLinkEmailHtml(email),
      text: buildInstallLinkEmailText(email)
    })
  })

  if (!response.ok) {
    console.error("send-install-link: Resend error", await response.text())
    return res.status(502).json({
      ok: false,
      error: "Could not send the email. Try again in a moment."
    })
  }

  return res.status(200).json({ ok: true })
}
