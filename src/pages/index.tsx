import Link from "next/link"

export default function IndexPage() {
  return (
    <main
      style={{
        background: "#f6efe4",
        color: "#2c2118",
        fontFamily:
          'Avenir Next, "Gill Sans", "Trebuchet MS", ui-sans-serif, sans-serif',
        minHeight: "100vh",
        padding: 32
      }}>
      <div
        style={{
          background: "#fffaf2",
          border: "1px solid #eadfce",
          borderRadius: 20,
          margin: "0 auto",
          maxWidth: 760,
          padding: 28
        }}>
        <p
          style={{
            color: "#9b7654",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.14em",
            margin: "0 0 8px",
            textTransform: "uppercase"
          }}>
          Local development
        </p>
        <h1 style={{ fontSize: 42, letterSpacing: "-0.04em", margin: 0 }}>
          Filler
        </h1>
        <p style={{ color: "#6b5d50", lineHeight: 1.6 }}>
          Local development page for the AI form filler extension.
        </p>
        <Link href="/debug-form">Open debug form</Link>
      </div>
    </main>
  )
}
