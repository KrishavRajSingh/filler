import { absoluteUrl, CHROME_STORE_URL, SITE_NAME } from "~lib/site"

export function buildInstallLinkEmailHtml(email: string): string {
  const landingUrl = absoluteUrl("/")

  return `
    <p>Hi,</p>
    <p>You asked for the ${SITE_NAME} install link from your phone. ${SITE_NAME} is a Chrome extension — it installs on desktop, not mobile.</p>
    <p><strong><a href="${CHROME_STORE_URL}">Add ${SITE_NAME} to Chrome</a></strong></p>
    <p>Or open <a href="${landingUrl}">${landingUrl}</a> on your computer and click Add to Chrome.</p>
    <p>Setup takes about two minutes. Pin the extension, save your profile once, then click Fill on your next form.</p>
    <p>— ${SITE_NAME}</p>
    <p style="color:#888;font-size:12px;">Sent to ${email}</p>
  `.trim()
}

export function buildInstallLinkEmailText(email: string): string {
  const landingUrl = absoluteUrl("/")

  return [
    "Hi,",
    "",
    `You asked for the ${SITE_NAME} install link from your phone. ${SITE_NAME} is a Chrome extension — it installs on desktop, not mobile.`,
    "",
    `Add to Chrome: ${CHROME_STORE_URL}`,
    `Landing page: ${landingUrl}`,
    "",
    "Setup takes about two minutes. Pin the extension, save your profile once, then click Fill on your next form.",
    "",
    `— ${SITE_NAME}`,
    "",
    `Sent to ${email}`
  ].join("\n")
}
