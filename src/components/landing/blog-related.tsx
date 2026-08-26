import { BLOG_POSTS } from "~lib/blog"

export function BlogRelated({ current }: { current: string }) {
  const related = BLOG_POSTS.filter((post) => post.slug !== current)

  return (
    <section className="landing-doc-section">
      <h2>More from the blog</h2>
      <ul className="landing-blog-list">
        {related.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`}>{post.title}</a>
            <p>{post.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
