export default function DebugFormPage() {
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
      <form
        style={{
          background: "#fffaf2",
          border: "1px solid #eadfce",
          borderRadius: 20,
          boxShadow: "0 18px 50px rgba(48, 36, 24, 0.08)",
          display: "grid",
          gap: 14,
          margin: "0 auto",
          maxWidth: 720,
          padding: 24
        }}>
        <div>
          <p
            style={{
              color: "#9b7654",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
              margin: "0 0 8px",
              textTransform: "uppercase"
            }}>
            Manual verification
          </p>
          <h1 style={{ fontSize: 38, letterSpacing: "-0.04em", margin: 0 }}>
            Debug Form
          </h1>
        </div>

        <Field label="Full name">
          <input id="name" name="name" type="text" />
        </Field>

        <Field label="Email">
          <input id="email" name="email" type="email" />
        </Field>

        <Field label="Company name">
          <input id="company" name="company" type="text" />
        </Field>

        <Field label="How many users do you have?">
          <input id="users" name="users" type="number" />
        </Field>

        <Field label="Tell us what you are building">
          <textarea id="pitch" name="pitch" rows={4} />
        </Field>

        <Field label="Company stage">
          <select id="stage" name="stage">
            <option value="">Select one</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
          </select>
        </Field>

        <fieldset style={fieldsetStyle}>
          <legend>Are you incorporated?</legend>
          <label>
            <input name="incorporated" type="radio" value="yes" />
            Yes
          </label>
          <label>
            <input name="incorporated" type="radio" value="no" />
            No
          </label>
        </fieldset>

        <fieldset style={fieldsetStyle}>
          <legend>What are you interested in?</legend>
          <label>
            <input name="interest" type="checkbox" value="funding" />
            Funding
          </label>
          <label>
            <input name="interest" type="checkbox" value="mentorship" />
            Mentorship
          </label>
        </fieldset>

        <button style={buttonStyle} type="button">
          Do not submit
        </button>
      </form>
    </main>
  )
}

function Field({
  children,
  label
}: {
  children: React.ReactElement
  label: string
}) {
  const id = children.props.id as string

  return (
    <label style={{ display: "grid", gap: 6 }} htmlFor={id}>
      <span style={{ color: "#5f5145", fontSize: 13, fontWeight: 800 }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const fieldsetStyle = {
  border: "1px solid #decfba",
  borderRadius: 14,
  display: "grid",
  gap: 8,
  margin: 0,
  padding: 14
} satisfies React.CSSProperties

const buttonStyle = {
  background: "#fff",
  border: "1px solid #decfba",
  borderRadius: 999,
  color: "#2c2118",
  font: "inherit",
  fontWeight: 900,
  padding: "11px 14px"
} satisfies React.CSSProperties
