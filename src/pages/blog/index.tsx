import { LandingBrand } from "~components/landing/landing-brand"
import { PageHead } from "~components/landing/page-head"
import { BLOG_POSTS } from "~lib/blog"
import { absoluteUrl } from "~lib/site"

const BLOG_DESCRIPTION =
  "Guides on autofill tools, form automation, and filling web forms faster — from the makers of Filler."

const BLOG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Filler Blog",
  url: absoluteUrl("/blog"),
  description: BLOG_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "Filler",
    url: "https://filler.live",
    logo: {
      "@type": "ImageObject",
      url: "https://filler.live/og-image.png"
    }
  },
  blogPost: BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: absoluteUrl(`/blog/${post.slug}`)
  }))
} as const

export default function BlogIndexPage() {
  return (
    <>
      <PageHead
        description={BLOG_DESCRIPTION}
        jsonLd={BLOG_JSON_LD}
        path="/blog"
        title="Blog"
      />
      <main className="landing landing-doc">
        <article className="landing-inner">
          <nav aria-label="Main navigation" className="landing-nav landing-nav-compact">
            <LandingBrand />
          </nav>

          <header className="landing-doc-header">
            <p className="landing-section-tag">[●] Blog</p>
            <h1 className="landing-doc-title">Autofill, form automation &amp; filling forms faster</h1>
            <p className="landing-doc-updated">{BLOG_POSTS.length} articles</p>
          </header>

          {BLOG_POSTS.map((post) => (
            <section className="landing-doc-section" key={post.slug}>
              <h2>
                <a className="landing-blog-headline" href={`/blog/${post.slug}`}>
                  {post.title}
                </a>
              </h2>
              <p>{post.description}</p>
              <p className="landing-doc-updated">{post.tag}</p>
            </section>
          ))}

          <section className="landing-doc-section">
            <h2>
              <a className="landing-blog-headline" href="/forms">
                Form guides
              </a>
            </h2>
            <p>
              Field-by-field walkthroughs of specific forms, like the NPI
              application.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
