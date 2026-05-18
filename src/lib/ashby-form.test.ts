import { describe, expect, it } from "vitest"

import { applyFillInstructions } from "./form-fill"
import { extractFieldsFromDocument } from "./form-extraction"
import type { FillInstruction } from "./fill-schemas"

describe("Ashby form support", () => {
  it("uses role=group text as context for Ashby combobox fields", async () => {
    document.body.innerHTML = `
      <form>
        <div role="group">
          <div>What year did you graduate from university (college/bachelors degree)?*</div>
          <div>
            <input role="combobox" placeholder="Start typing..." value="">
            <button type="button">Open</button>
          </div>
        </div>
        <div role="group">
          <div>Based on your experience and strength, where on the scale would you place yourself as an engineer?*</div>
          <div>
            <p>We're interested to learn if you see yourself as a backend, frontend or full-stack engineer.</p>
            <p>1: You are a strong backend engineer but not frontend</p>
            <p>5: You are equally good in backend as in frontend</p>
            <p>10: You are a strong frontend engineer but not backend</p>
          </div>
          <div>
            <input role="combobox" placeholder="Start typing..." value="">
            <button type="button">Open</button>
          </div>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(2)
    expect(fields[0]).toMatchObject({
      labelText: "What year did you graduate from university (college/bachelors degree)?*",
      nearbyText: "What year did you graduate from university (college/bachelors degree)?*"
    })
    expect(fields[1]).toMatchObject({
      labelText:
        "Based on your experience and strength, where on the scale would you place yourself as an engineer?*"
    })
    expect(fields[1].nearbyText).toContain("1: You are a strong backend engineer")
    expect(fields[1].nearbyText).toContain("10: You are a strong frontend engineer")
  })

  it("captures bullet-style instructions around Ashby textareas", async () => {
    document.body.innerHTML = `
      <form>
        <div>
          <div>What is your current location and primary working timezone?*</div>
          <div>
            <p><strong>Please answer in this exact format: Country - City - Time zone</strong></p>
            <p>Example: Germany - Berlin - CET</p>
            <ul>
              <li>United Kingdom - London - GMT/BST</li>
              <li>India - Bangalore - IST</li>
            </ul>
          </div>
          <textarea id="location" placeholder="Type here..."></textarea>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0].labelText).toBe(
      "What is your current location and primary working timezone?*"
    )
    expect(fields[0].nearbyText).toContain(
      "Please answer in this exact format: Country - City - Time zone"
    )
    expect(fields[0].nearbyText).toContain("India - Bangalore - IST")
  })

  it("extracts Ashby fieldset labels that are not directly associated with the input", async () => {
    document.body.innerHTML = `
      <form>
        <div data-field-path="1565fa02-85f9-4449-af1d-787de92dbf0e">
          <fieldset class="_container_nh65k_29 _fieldEntry_17tft_29">
            <label
              class="_heading_101oc_53 _required_101oc_92 _label_17tft_43 ashby-application-form-question-title"
              for="1565fa02-85f9-4449-af1d-787de92dbf0e"
            >
              What year did you graduate from university (college/bachelors degree)?
            </label>
            <div class="_inputContainer_v5ami_28">
              <input
                class="_input_v5ami_28"
                placeholder="Start typing..."
                aria-autocomplete="list"
                aria-expanded="false"
                aria-haspopup="listbox"
                role="combobox"
                value=""
              >
              <button class="_container_pjyt6_1 _toggleButton_v5ami_32">
                Open
              </button>
            </div>
          </fieldset>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({
      labelText: "What year did you graduate from university (college/bachelors degree)?",
      nearbyText: "What year did you graduate from university (college/bachelors degree)?",
      required: true
    })
  })

  it("treats selectOption instructions for radio choices as a click", async () => {
    document.body.innerHTML = `
      <form>
        <div role="group">
          <div>In the past 3 years, how much of your work was 100% remote?*</div>
          <div>
            <input id="remote-none" type="radio" name="remote">
            <label for="remote-none">None</label>
          </div>
          <div>
            <input id="remote-three" type="radio" name="remote">
            <label for="remote-three">About 3 years</label>
          </div>
        </div>
      </form>
    `

    const instructions: FillInstruction[] = [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "field-1",
        value: "About 3 years"
      }
    ]

    const result = await applyFillInstructions(document, instructions)

    expect(result).toEqual({ filled: 1, skipped: 0 })
    expect((document.getElementById("remote-three") as HTMLInputElement).checked).toBe(
      true
    )
  })
})
