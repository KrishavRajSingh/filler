import { useState, type CSSProperties } from "react"

import { MobileInstallModal } from "~components/landing/mobile-install-modal"
import { useIsMobile } from "~components/landing/use-is-mobile"
import { trackEvent } from "~lib/analytics"
import { CHROME_STORE_URL } from "~lib/site"

export type InstallCtaLocation = "nav" | "hero" | "footer"

function ChromeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="landing-btn-icon"
      height="18"
      viewBox="0 0 24 24"
      width="18">
      <circle cx="12" cy="12" fill="#fff" r="10.5" />
      <path
        d="M12 2.25c4.28 0 7.86 2.94 8.87 6.92H12a5.75 5.75 0 0 0-5.02 2.94L2.7 6.38A9.72 9.72 0 0 1 12 2.25Z"
        fill="#EA4335"
      />
      <path
        d="M3.56 7.32 7.98 15a5.75 5.75 0 0 0 4.02 1.95h8.87A9.72 9.72 0 0 1 3.56 7.32Z"
        fill="#34A853"
      />
      <path
        d="M12 17.75A5.75 5.75 0 0 1 6.25 12c0-1.02.27-1.98.74-2.81l4.42 7.68A5.73 5.73 0 0 1 12 17.75Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.25A5.75 5.75 0 0 1 17.75 12c0 1.02-.27 1.98-.74 2.81H8.59A5.75 5.75 0 0 1 12 6.25Z"
        fill="#4285F4"
      />
      <circle cx="12" cy="12" fill="#fff" r="4.25" />
      <circle cx="12" cy="12" fill="#4285F4" r="3.1" />
    </svg>
  )
}

export function InstallCta({
  className,
  label = "Add to Chrome",
  location,
  showMeta = false,
  style,
  variant = "default"
}: {
  className?: string
  label?: string
  location: InstallCtaLocation
  showMeta?: boolean
  style?: CSSProperties
  variant?: "default" | "primary"
}) {
  const isMobile = useIsMobile()
  const [modalOpen, setModalOpen] = useState(false)

  const buttonClassName = [
    className,
    variant === "primary" ? "landing-btn-primary" : "",
    "landing-btn-with-icon"
  ]
    .filter(Boolean)
    .join(" ")

  function openMobileModal() {
    trackEvent("mobile_install_modal_open", { location })
    setModalOpen(true)
  }

  const button = isMobile ? (
    <button
      className={buttonClassName}
      onClick={openMobileModal}
      style={style}
      type="button">
      <ChromeIcon />
      {label}
    </button>
  ) : (
    <a
      className={buttonClassName}
      href={CHROME_STORE_URL}
      onClick={() => trackEvent("add_to_chrome", { location })}
      rel="noopener noreferrer"
      style={style}
      target="_blank">
      <ChromeIcon />
      {label}
    </a>
  )

  const content = (
    <>
      {button}
      {modalOpen ? (
        <MobileInstallModal
          location={location}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  )

  if (!showMeta) {
    return content
  }

  return (
    <div className="landing-cta-wrap">
      {content}
      <p className="landing-cta-meta">
        {isMobile
          ? "Chrome extension · desktop only · free"
          : "Free · No account · Works on Google Forms, job apps, and signups"}
      </p>
    </div>
  )
}
