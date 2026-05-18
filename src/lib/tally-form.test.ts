import { describe, expect, it } from "vitest"

import { applyFillInstructions } from "./form-fill"
import { extractFieldsFromDocument } from "./form-extraction"
import type { FillInstruction } from "./fill-schemas"

function installTallyDropdownOptions(inputId: string, options: string[]) {
  const input = document.getElementById(inputId)
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Missing input ${inputId}`)
  }

  input.addEventListener("click", () => {
    if (document.querySelector(".list-item")) return

    const menu = document.createElement("div")
    menu.className = "tally-options"

    for (const option of options) {
      const item = document.createElement("div")
      item.className = "list-item"
      item.textContent = option
      item.addEventListener("click", () => {
        input.value = option
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
        menu.remove()
      })
      menu.append(item)
    }

    input.parentElement?.append(menu)
  })
}

function installDelayedTallyDropdownOptions(inputId: string, options: string[]) {
  const input = document.getElementById(inputId)
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Missing input ${inputId}`)
  }

  input.addEventListener("click", () => {
    window.setTimeout(() => {
      if (document.querySelector(".list-item")) return

      const menu = document.createElement("div")
      menu.className = "tally-options"

      for (const option of options) {
        const item = document.createElement("div")
        item.className = "list-item"
        item.textContent = option
        item.addEventListener("click", () => {
          input.value = option
          input.dispatchEvent(new Event("input", { bubbles: true }))
          input.dispatchEvent(new Event("change", { bubbles: true }))
          menu.remove()
        })
        menu.append(item)
      }

      input.parentElement?.append(menu)
    }, 25)
  })
}

describe("Tally form support", () => {
  it("extracts custom dropdown options with the preceding Tally title as the label", async () => {
    document.body.innerHTML = `
      <form>
        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>How many founders are applying?</h3>
        </div>
        <div class="tally-block tally-block-dropdown" data-block-type="DROPDOWN">
          <div data-sentry-component="CustomSelect">
            <input id="founder-count" autocomplete="off" type="text" value="">
          </div>
        </div>
      </form>
    `
    installDelayedTallyDropdownOptions("founder-count", ["1", "2", "3", "4"])

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(1)
    expect(fields[0]).toMatchObject({
      inputType: "text",
      labelText: "How many founders are applying?",
      options: [
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" }
      ]
    })
  })

  it("keeps radio option labels while adding the Tally group question to nearby text", async () => {
    document.body.innerHTML = `
      <form>
        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>Are you technical?</h3>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <div id="legend_technical">Are you technical?</div>
          <input id="technical_yes" required aria-describedby="legend_technical" type="radio" name="technical">
          <label for="technical_yes">Yes</label>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <input id="technical_no" required aria-describedby="legend_technical" type="radio" name="technical">
          <label for="technical_no">No</label>
        </div>
      </form>
    `

    const fields = await extractFieldsFromDocument(document)

    expect(fields).toHaveLength(2)
    expect(fields[0]).toMatchObject({
      inputType: "radio",
      labelText: "Yes",
      nearbyText: "Are you technical? Yes"
    })
    expect(fields[1]).toMatchObject({
      inputType: "radio",
      labelText: "No",
      nearbyText: "Are you technical? No"
    })
  })

  it("clicks Tally radio inputs so the app receives the selection", async () => {
    document.body.innerHTML = `
      <form>
        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>Are you technical?</h3>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <div id="legend_technical">Are you technical?</div>
          <input id="technical_yes" required aria-describedby="legend_technical" type="radio" name="technical">
          <label for="technical_yes">Yes</label>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <input id="technical_no" required aria-describedby="legend_technical" type="radio" name="technical">
          <label for="technical_no">No</label>
        </div>
      </form>
    `

    const yes = document.getElementById("technical_yes")
    if (!(yes instanceof HTMLInputElement)) {
      throw new Error("Missing technical yes input")
    }
    yes.addEventListener("click", () => {
      document.body.dataset.tallySelected = "technical:yes"
    })

    const instructions: FillInstruction[] = [
      {
        action: "check",
        confidence: "high",
        fieldId: "field-0",
        value: "Yes"
      }
    ]

    const result = await applyFillInstructions(document, instructions)

    expect(result).toEqual({ filled: 1, skipped: 0 })
    expect(yes.checked).toBe(true)
    expect(document.body.dataset.tallySelected).toBe("technical:yes")
  })

  it("selects a matching option from a Tally custom dropdown", async () => {
    document.body.innerHTML = `
      <form>
        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>How many founders are applying?</h3>
        </div>
        <div class="tally-block tally-block-dropdown" data-block-type="DROPDOWN">
          <div data-sentry-component="CustomSelect">
            <input id="founder-count" autocomplete="off" type="text" value="">
          </div>
        </div>
      </form>
    `
    installDelayedTallyDropdownOptions("founder-count", ["1", "2", "3", "4"])

    const instructions: FillInstruction[] = [
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "field-0",
        value: "2"
      }
    ]

    const result = await applyFillInstructions(document, instructions)

    expect(result).toEqual({ filled: 1, skipped: 0 })
    expect((document.getElementById("founder-count") as HTMLInputElement).value).toBe(
      "2"
    )
    expect(document.querySelector(".list-item")).toBeNull()
  })
})
