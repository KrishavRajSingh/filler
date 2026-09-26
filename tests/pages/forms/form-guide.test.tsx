import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FORM_GUIDES, getFormGuide } from "~lib/form-guides"
import FormGuidePage, { getStaticPaths, getStaticProps } from "~pages/forms/[slug]"
import FormsIndexPage from "~pages/forms/index"

describe("form guides", () => {
  it("has unique slugs", () => {
    const slugs = FORM_GUIDES.map((guide) => guide.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("builds a static path for every guide", async () => {
    const result = await getStaticPaths({})
    expect(result.paths).toHaveLength(FORM_GUIDES.length)
  })

  it("returns notFound for an unknown slug", async () => {
    const result = await getStaticProps({ params: { slug: "missing" } })
    expect(result).toEqual({ notFound: true })
  })

  it("renders the NPI guide with an install CTA and FAQ", () => {
    const guide = getFormGuide("npi-application")!
    render(<FormGuidePage guide={guide} />)

    expect(
      screen.getByRole("heading", { level: 1, name: guide.title })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /add to chrome/i })).toBeInTheDocument()
    expect(
      screen.getByText("What do I put for endpoint on the NPI application?")
    ).toBeInTheDocument()
  })

  it("lists every guide on the forms index", () => {
    render(<FormsIndexPage />)

    for (const guide of FORM_GUIDES) {
      expect(screen.getByRole("link", { name: guide.title })).toHaveAttribute(
        "href",
        `/forms/${guide.slug}`
      )
    }
  })
})
