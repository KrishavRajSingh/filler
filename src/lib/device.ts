export function isLikelyMobileEnvironment(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const mobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

  if (mobileUserAgent) {
    return true
  }

  return (
    window.matchMedia("(max-width: 768px)").matches &&
    navigator.maxTouchPoints > 0
  )
}
