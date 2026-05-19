import { beforeEach, describe, expect, it } from "vitest"
import { applyInstructionsInPage, collectFieldsInPage } from "./page-functions"

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

describe("page scripting functions", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("collects visible native form controls", async () => {
    document.body.innerHTML = `
      <form>
        <label for="name">What's your name?</label>
        <input id="name" name="name" />
        <label for="founders">How many founders are applying?</label>
        <select id="founders" name="founders">
          <option value="">Select</option>
          <option value="1">1</option>
        </select>
      </form>
    `

    const response = await collectFieldsInPage(0, "https://f.inc/apply")

    expect(response.fields).toMatchObject([
      {
        id: "frame-0-field-0",
        labelText: "What's your name?",
        tagName: "input"
      },
      {
        id: "frame-0-field-1",
        labelText: "How many founders are applying?",
        options: [
          { label: "Select", value: "" },
          { label: "1", value: "1" }
        ],
        tagName: "select"
      }
    ])
  })

  it("applies text and select instructions to native controls", async () => {
    document.body.innerHTML = `
      <form>
        <label for="name">What's your name?</label>
        <input id="name" name="name" />
        <label for="founders">How many founders are applying?</label>
        <select id="founders" name="founders">
          <option value="">Select</option>
          <option value="1">1</option>
        </select>
      </form>
    `

    const response = await applyInstructionsInPage([
      {
        action: "setValue",
        confidence: "high",
        fieldId: "frame-0-field-0",
        value: "Ada"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-1",
        value: "1"
      }
    ])

    expect(response).toEqual({ filled: 2, ok: true, skipped: 0 })
    expect(document.querySelector<HTMLInputElement>("#name")?.value).toBe("Ada")
    expect(document.querySelector<HTMLSelectElement>("#founders")?.value).toBe("1")
  })

  it("extracts Tally custom dropdown options with the preceding title as the label", async () => {
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

    const response = await collectFieldsInPage(0, "https://f.inc/apply")

    expect(response.fields).toHaveLength(1)
    expect(response.fields[0]).toMatchObject({
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

    const response = await applyInstructionsInPage([
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-0",
        value: "2"
      }
    ])

    expect(response).toEqual({ filled: 1, ok: true, skipped: 0 })
    expect(document.querySelector<HTMLInputElement>("#founder-count")?.value).toBe("2")
    expect(document.querySelector(".list-item")).toBeNull()
  })

  it("clicks radio inputs so Tally receives bullet-style selections", async () => {
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

    const response = await applyInstructionsInPage([
      {
        action: "check",
        confidence: "high",
        fieldId: "frame-0-field-0",
        value: "Yes"
      }
    ])

    expect(response).toEqual({ filled: 1, ok: true, skipped: 0 })
    expect(yes.checked).toBe(true)
    expect(document.body.dataset.tallySelected).toBe("technical:yes")
  })

  it("adds the parent Tally question to Yes/No radio nearby text", async () => {
    document.body.innerHTML = `
      <form>
        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>Are you technical?</h3>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <input id="technical_yes" required type="radio" name="technical">
          <label for="technical_yes">Yes</label>
        </div>
        <div class="tally-block tally-block-multiple-choice-option" data-block-type="MULTIPLE_CHOICE_OPTION">
          <input id="technical_no" required type="radio" name="technical">
          <label for="technical_no">No</label>
        </div>
      </form>
    `

    const response = await collectFieldsInPage(0, "https://f.inc/apply")

    expect(response.fields).toMatchObject([
      {
        inputType: "radio",
        labelText: "Yes",
        nearbyText: "Are you technical? Yes"
      },
      {
        inputType: "radio",
        labelText: "No",
        nearbyText: "Are you technical? No"
      }
    ])
  })

  it("applies a live-like f.inc planner response to dropdowns and bullet selections", async () => {
    document.body.innerHTML = `
      <form>
        <label for="name">What's your name?</label>
        <input id="name" name="name" />

        <div class="tally-block tally-block-title" data-block-type="TITLE">
          <h3>How many founders are applying?</h3>
        </div>
        <div class="tally-block tally-block-dropdown" data-block-type="DROPDOWN">
          <div data-sentry-component="CustomSelect">
            <input id="founder-count" autocomplete="off" type="text" value="">
          </div>
        </div>

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
    installDelayedTallyDropdownOptions("founder-count", ["1", "2", "3", "4"])

    const yes = document.getElementById("technical_yes")
    if (!(yes instanceof HTMLInputElement)) {
      throw new Error("Missing technical yes input")
    }
    yes.addEventListener("click", () => {
      document.body.dataset.tallySelected = "technical:yes"
    })

    const response = await applyInstructionsInPage([
      {
        action: "setValue",
        confidence: "high",
        fieldId: "frame-1-field-0",
        value: "Krishav Raj Singh"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-1-field-1",
        value: "1"
      },
      {
        action: "check",
        confidence: "high",
        fieldId: "frame-1-field-2",
        value: "Yes"
      },
      {
        action: "skip",
        confidence: "high",
        fieldId: "frame-1-field-3"
      }
    ])

    expect(response).toEqual({ filled: 3, ok: true, skipped: 1 })
    expect(document.querySelector<HTMLInputElement>("#name")?.value).toBe(
      "Krishav Raj Singh"
    )
    expect(document.querySelector<HTMLInputElement>("#founder-count")?.value).toBe("1")
    expect(yes.checked).toBe(true)
    expect(document.body.dataset.tallySelected).toBe("technical:yes")
  })

  it("extracts Google Forms listboxes and ARIA radio groups", async () => {
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
          </div>
        </div>
        <div role="listitem">
          <div>Are you available for full time job? *</div>
          <div role="radio" aria-label="Yes" aria-checked="false"></div>
          <div role="radio" aria-label="No" aria-checked="false"></div>
        </div>
      </form>
    `

    const response = await collectFieldsInPage(0, "https://docs.google.com/forms/d/e/test/viewform")

    expect(response.fields).toMatchObject([
      {
        controlKind: "native",
        labelText: "Name",
        required: true,
        tagName: "input"
      },
      {
        controlKind: "aria-listbox",
        labelText: "Graduation Year",
        options: [
          { label: "2024", value: "2024" },
          { label: "2025", value: "2025" }
        ],
        required: true,
        role: "listbox",
        tagName: "div"
      },
      {
        controlKind: "aria-radio-group",
        labelText: "Are you available for full time job?",
        options: [
          { label: "Yes", value: "Yes" },
          { label: "No", value: "No" }
        ],
        required: true,
        role: "radio",
        tagName: "div"
      }
    ])
  })

  it("fills Google Forms listboxes and ARIA radio groups", async () => {
    document.body.innerHTML = `
      <form>
        <input type="hidden" name="entry.1" value="">
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
          <div>Are you available for full time job? *</div>
          <div role="radio" aria-label="Yes" aria-checked="false"></div>
          <div role="radio" aria-label="No" aria-checked="false"></div>
        </div>
      </form>
    `
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

    const response = await applyInstructionsInPage([
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-0",
        value: "2025"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-1",
        value: "Yes"
      }
    ])

    expect(response).toEqual({ filled: 2, ok: true, skipped: 0 })
    expect(document.querySelector<HTMLInputElement>('input[name="entry.1"]')?.value).toBe(
      "2025"
    )
    expect(
      document.querySelector<HTMLElement>('[role="listbox"]')?.getAttribute("aria-expanded")
    ).toBe("false")
    expect(
      document
        .querySelector<HTMLElement>('[role="radio"][aria-label="Yes"]')
        ?.getAttribute("aria-checked")
    ).toBe("true")
  })

  it("keeps multiple Google Forms listboxes collapsed after committing hidden values", async () => {
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
      .querySelectorAll<HTMLElement>('[role="option"]')
      .forEach((option) => {
        option.addEventListener("click", () => {
          window.setTimeout(() => {
            option
              .closest<HTMLElement>('[role="listbox"]')
              ?.setAttribute("aria-expanded", "true")
          }, 0)
        })
      })

    const response = await applyInstructionsInPage([
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-0",
        value: "2025"
      },
      {
        action: "selectOption",
        confidence: "high",
        fieldId: "frame-0-field-1",
        value: "B.Tech/B.E./M.Tech in Computer Science"
      }
    ])
    await new Promise((resolve) => window.setTimeout(resolve, 0))

    expect(response).toEqual({ filled: 2, ok: true, skipped: 0 })
    expect(
      Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"]')).map(
        (listbox) => listbox.getAttribute("aria-expanded")
      )
    ).toEqual(["false", "false"])
    expect(
      Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).map(
        (option) => ({
          label: option.textContent?.trim(),
          selected: option.getAttribute("aria-selected"),
          visuallySelected:
            option.classList.contains("KKjvXb") && option.classList.contains("DEh1R")
        })
      )
    ).toEqual([
      { label: "Choose", selected: "false", visuallySelected: false },
      { label: "2025", selected: "true", visuallySelected: true },
      { label: "Choose", selected: "false", visuallySelected: false },
      {
        label: "B.Tech/B.E./M.Tech in Computer Science",
        selected: "true",
        visuallySelected: true
      }
    ])
    expect(document.querySelector<HTMLInputElement>('input[name="entry.1"]')?.value).toBe(
      "2025"
    )
    expect(document.querySelector<HTMLInputElement>('input[name="entry.2"]')?.value).toBe(
      "B.Tech/B.E./M.Tech in Computer Science"
    )
  })

  it("extracts and fills Google Forms checkbox groups from the live public form shape", async () => {
    document.body.innerHTML = `
      <form>
        <div role="listitem">
          <div>Name</div>
          <input type="text" aria-label="Your answer" value="">
        </div>
        <div role="listitem">
          <div>Select something</div>
          <div role="checkbox" aria-label="Point 1 - it's the first point" aria-checked="false"></div>
          <div role="checkbox" aria-label="Point 2 - it's the second point" aria-checked="false"></div>
        </div>
      </form>
    `
    document
      .querySelectorAll<HTMLElement>('[role="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
          checkbox.setAttribute(
            "aria-checked",
            checkbox.getAttribute("aria-checked") === "true" ? "false" : "true"
          )
        })
      })

    const extracted = await collectFieldsInPage(
      0,
      "https://docs.google.com/forms/d/e/sample/viewform"
    )

    expect(extracted.fields).toMatchObject([
      {
        controlKind: "native",
        labelText: "Name",
        tagName: "input"
      },
      {
        controlKind: "aria-checkbox-group",
        labelText: "Select something",
        options: [
          {
            label: "Point 1 - it's the first point",
            value: "Point 1 - it's the first point"
          },
          {
            label: "Point 2 - it's the second point",
            value: "Point 2 - it's the second point"
          }
        ],
        role: "checkbox",
        tagName: "div"
      }
    ])

    const filled = await applyInstructionsInPage([
      {
        action: "check",
        confidence: "high",
        fieldId: "frame-0-field-1",
        value: "Point 1 - it's the first point"
      }
    ])

    expect(filled).toEqual({ filled: 1, ok: true, skipped: 0 })
    expect(
      document
        .querySelector<HTMLElement>(
          `[role="checkbox"][aria-label="Point 1 - it's the first point"]`
        )
        ?.getAttribute("aria-checked")
    ).toBe("true")
  })
})
