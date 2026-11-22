import { absoluteUrl, CHROME_STORE_URL, SITE_NAME } from "~lib/site"

export type WaitlistKind = "beta" | "pass"

type WaitlistEmail = { subject: string; html: string; text: string }

const COPY: Record<WaitlistKind, { subject: string; lines: string[] }> = {
  beta: {
    subject: `You're on the ${SITE_NAME} list`,
    lines: [
      `Thanks for signing up. You're on the list, and we'll email you when there's something new to try.`,
      `You don't have to wait, though: ${SITE_NAME} is already free on the Chrome Web Store. Save your profile once, then click Fill on any form. It never submits for you.`,
      `One question: what form do you fill most often? Just hit reply. We read every answer and it decides what we build next.`
    ]
  },
  pass: {
    subject: "You're on the Job Hunt Pass list",
    lines: [
      `Thanks for your interest in the Job Hunt Pass. It isn't ready yet. We'll email you once when it is, and nothing is charged unless you decide to buy it then.`,
      `Until then, free ${SITE_NAME} already fills your details and reuses answers you saved on job applications.`,
      `What job questions take you the longest? Just hit reply. It shapes what the pass writes.`
    ]
  }
}

export function buildWaitlistEmail(
  kind: WaitlistKind,
  email: string
): WaitlistEmail {
  const { subject, lines } = COPY[kind]
  const landingUrl = absoluteUrl("/")

  const html = `
    <p>Hi,</p>
    ${lines.map((line) => `<p>${line}</p>`).join("\n    ")}
    <p><a href="${CHROME_STORE_URL}">Add ${SITE_NAME} to Chrome</a> · <a href="${landingUrl}">${landingUrl.replace(/^https?:\/\//, "")}</a></p>
    <p>— ${SITE_NAME}</p>
    <p style="color:#888;font-size:12px;">Sent to ${email} because you signed up on ${landingUrl.replace(/^https?:\/\//, "")}.</p>
  `.trim()

  const text = [
    "Hi,",
    "",
    ...lines.flatMap((line) => [line, ""]),
    `Add to Chrome: ${CHROME_STORE_URL}`,
    `Site: ${landingUrl}`,
    "",
    `— ${SITE_NAME}`,
    "",
    `Sent to ${email} because you signed up on ${landingUrl}.`
  ].join("\n")

  return { subject, html, text }
}
