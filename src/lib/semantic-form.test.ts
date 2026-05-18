import { describe, expect, it } from "vitest"

import type { FillInstruction } from "./fill-schemas"
import { extractFieldsFromDocument } from "./form-extraction"
import { applyFillInstructions } from "./form-fill"

describe("semantic form extraction", () => {
  it("extracts question blocks with native text controls and ARIA listboxes", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div>Name *</div>
          <input type="text" aria-label="Your answer" value="">
        </div>
        <div role="listitem">
          <div>Graduation Year *</div>
          <div role="listbox" aria-expanded="false">
            <div role="option" aria-selected="true">Choose</div>
            <div role="option" aria-selected="false">2024</div>
            <div role="option" aria-selected="false">2025</div>
            <div role="option" aria-selected="false">2026</div>
          </div>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(2)
    expect(fields[0]).toMatchObject({
      controlKind: "native",
      labelText: "Name",
      required: true,
      tagName: "input"
    })
    expect(fields[1]).toMatchObject({
      controlKind: "aria-listbox",
      labelText: "Graduation Year",
      options: [
        { label: "2024", value: "2024" },
        { label: "2025", value: "2025" },
        { label: "2026", value: "2026" }
      ],
      required: true,
      role: "listbox",
      tagName: "div"
    })
  })

  it("uses heading text inside a question block as the field label", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div role="heading" aria-level="3">
            <span>Name</span>
            <span aria-label="Required question"> *</span>
          </div>
          <div>
            <input type="text" aria-label="Your answer" value="">
          </div>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({
      labelText: "Name",
      required: true
    })
  })

  it("keeps disabled native controls when they belong to a semantic question block", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div role="heading" aria-level="3">
            <span>University name</span>
            <span aria-label="Required question"> *</span>
          </div>
          <input type="text" aria-disabled="true" disabled value="">
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({
      labelText: "University name",
      required: true
    })
  })

  it("extracts ARIA radio groups as a single semantic field", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div>Are you available for full time job? *</div>
          <div role="radio" aria-label="Yes" aria-checked="false"></div>
          <div role="radio" aria-label="No" aria-checked="false"></div>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({
      controlKind: "aria-radio-group",
      labelText: "Are you available for full time job?",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
      ],
      required: true,
      role: "radio",
      tagName: "div"
    })
  })

  it("fills ARIA listboxes and radio groups by clicking the chosen option", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div>Graduation Year *</div>
          <div role="listbox" aria-expanded="false">
            <div role="option" aria-selected="true">Choose</div>
            <div role="option" aria-selected="false">2024</div>
            <div role="option" aria-selected="false">2025</div>
          </div>
        </div>
        <div role="listitem">
          <div>Are you available for full time job? *</div>
          <div role="radio" aria-label="Yes" aria-checked="false"></div>
          <div role="radio" aria-label="No" aria-checked="false"></div>
        </div>
      </form>
    `
    document
      .querySelectorAll<HTMLElement>('[role="option"]')
      .forEach((option) => {
        option.addEventListener("click", () => {
          option
            .closest('[role="listbox"]')
            ?.querySelectorAll('[role="option"]')
            .forEach((candidate) =>
              candidate.setAttribute("aria-selected", "false")
            )
          option.setAttribute("aria-selected", "true")
        })
      })
    document
      .querySelectorAll<HTMLElement>('[role="radio"]')
      .forEach((radio) => {
        radio.addEventListener("click", () => {
          radio
            .closest('[role="listitem"]')
            ?.querySelectorAll('[role="radio"]')
            .forEach((candidate) =>
              candidate.setAttribute("aria-checked", "false")
            )
          radio.setAttribute("aria-checked", "true")
        })
      })

    const fields = await extractFieldsFromDocument(document)
    const instructions: FillInstruction[] = [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[0].id,
        value: "2025"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[1].id,
        value: "Yes"
      }
    ]

    const result = await applyFillInstructions(document, instructions)

    expect(result).toEqual({ filled: 2, skipped: 0 })
    expect(
      document
        .querySelector<HTMLElement>('[role="option"]:last-child')
        ?.getAttribute("aria-selected")
    ).toBe("true")
    expect(
      document
        .querySelector<HTMLElement>('[role="radio"][aria-label="Yes"]')
        ?.getAttribute("aria-checked")
    ).toBe("true")
  })

  it("uses a real mouse sequence for ARIA listbox options", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div>Graduation Year *</div>
          <div role="listbox" aria-expanded="false">
            <div role="option" aria-selected="true">Choose</div>
            <div role="option" aria-selected="false">2025</div>
          </div>
        </div>
      </form>
    `
    document
      .querySelectorAll<HTMLElement>('[role="option"]')
      .forEach((option) => {
        option.addEventListener("mousedown", () => {
          option
            .closest('[role="listbox"]')
            ?.querySelectorAll('[role="option"]')
            .forEach((candidate) =>
              candidate.setAttribute("aria-selected", "false")
            )
          option.setAttribute("aria-selected", "true")
        })
      })

    const fields = await extractFieldsFromDocument(document)
    const result = await applyFillInstructions(document, [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[0].id,
        value: "2025"
      }
    ])

    expect(result).toEqual({ filled: 1, skipped: 0 })
    expect(
      document
        .querySelector<HTMLElement>('[role="option"]:last-child')
        ?.getAttribute("aria-selected")
    ).toBe("true")
  })

  it("commits ARIA listbox answers to paired hidden entry inputs", async () => {
    document.body.innerHTML = `
      <form>
        <input type="hidden" name="entry.2" value="">
        <input type="hidden" name="entry.1" value="">
        <div role="listitem">
          <div>Name *</div>
          <input type="text" value="">
        </div>
        <div role="listitem">
          <div data-params='%.@.[1025124566,"Graduation Year",null,3,[[1,[["2025"]],true]]]'>
            <div>Graduation Year *</div>
            <div role="listbox" aria-expanded="true">
              <div role="option" aria-selected="true">Choose</div>
              <div role="option" aria-selected="false">2025</div>
            </div>
          </div>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)
    const result = await applyFillInstructions(document, [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[1].id,
        value: "2025"
      }
    ])

    expect(result).toEqual({ filled: 1, skipped: 0 })
    expect(
      document.querySelector<HTMLInputElement>('input[name="entry.1"]')?.value
    ).toBe("2025")
    expect(
      document
        .querySelector<HTMLElement>('[role="listbox"]')
        ?.getAttribute("aria-expanded")
    ).toBe("false")
    expect(
      document
        .querySelector<HTMLElement>('[role="option"]:last-child')
        ?.getAttribute("aria-selected")
    ).toBe("true")
  })

  it("keeps Google-style listboxes collapsed when filling multiple dropdowns", async () => {
    document.body.innerHTML = `
      <form>
        <input type="hidden" name="entry.1" value="">
        <input type="hidden" name="entry.2" value="">
        <div role="listitem">
          <div data-params='%.@.[1025124566,"Graduation Year",null,3,[[1,[["2025"]],true]]]'>
            <div>Graduation Year *</div>
            <div role="listbox" aria-expanded="true">
              <div role="option" aria-selected="true">Choose</div>
              <div role="option" aria-selected="false">2025</div>
            </div>
          </div>
        </div>
        <div role="listitem">
          <div data-params='%.@.[170385851,"Degree and Course Name",null,3,[[2,[["B.Tech/B.E./M.Tech in Computer Science"]],true]]]'>
            <div>Degree and Course Name *</div>
            <div role="listbox" aria-expanded="true">
              <div role="option" aria-selected="true">Choose</div>
              <div role="option" aria-selected="false">B.Tech/B.E./M.Tech in Computer Science</div>
            </div>
          </div>
        </div>
      </form>
    `
    document
      .querySelectorAll<HTMLElement>('[role="listbox"]')
      .forEach((listbox) => {
        listbox.addEventListener("click", () => {
          listbox.setAttribute("aria-expanded", "true")
        })
      })
    document
      .querySelectorAll<HTMLElement>('[role="option"]')
      .forEach((option) => {
        option.addEventListener("mousedown", () => {
          option
            .closest('[role="listbox"]')
            ?.querySelectorAll('[role="option"]')
            .forEach((candidate) =>
              candidate.setAttribute("aria-selected", "false")
            )
          option.setAttribute("aria-selected", "true")
        })
      })

    const fields = await extractFieldsFromDocument(document)
    const result = await applyFillInstructions(document, [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[0].id,
        value: "2025"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: fields[1].id,
        value: "B.Tech/B.E./M.Tech in Computer Science"
      }
    ])

    expect(result).toEqual({ filled: 2, skipped: 0 })
    expect(
      Array.from(
        document.querySelectorAll<HTMLElement>('[role="listbox"]')
      ).map((listbox) => listbox.getAttribute("aria-expanded"))
    ).toEqual(["false", "false"])
    expect(
      document.querySelector<HTMLInputElement>('input[name="entry.1"]')?.value
    ).toBe("2025")
    expect(
      document.querySelector<HTMLInputElement>('input[name="entry.2"]')?.value
    ).toBe("B.Tech/B.E./M.Tech in Computer Science")
  })
})
