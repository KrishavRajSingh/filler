export type BlogPost = {
  slug: string
  title: string
  description: string
  tag: string
  updated: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-autofill-tools",
    title: "Best autofill tools for different form types in 2026",
    description:
      "Browser autofill vs password managers vs form automation extensions — which to use, and for which forms.",
    tag: "Comparison",
    updated: "May 22, 2026"
  },
  {
    slug: "form-automation-software",
    title: "Form automation software: what it is and why it matters",
    description:
      "What form automation software is, why teams choose it over manual entry, and where to start.",
    tag: "Guide",
    updated: "May 22, 2026"
  },
  {
    slug: "how-to-fill-forms-faster",
    title: "How to fill forms faster: tools and techniques that work",
    description:
      "Autofill tools, response templates, and keyboard shortcuts that cut time on repetitive forms.",
    tag: "Guide",
    updated: "May 22, 2026"
  }
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
