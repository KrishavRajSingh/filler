import { describe, expect, it } from "vitest"

import { buildPlannerPrompt } from "./fill"
import type { FillRequest } from "~lib/fill-schemas"

describe("buildPlannerPrompt", () => {
  it("tells the planner to draft reviewable answers instead of skipping uncertain application fields", () => {
    const request: FillRequest = {
      fields: [
        {
          id: "field-0",
          tagName: "textarea",
          ariaLabel: "What is the coolest thing you have ever built?",
          required: true
        }
      ],
      page: {
        headings: ["Founder background"],
        title: "Apply",
        url: "https://example.com/apply"
      },
      profile: {
        sections: [
          {
            fields: [
              {
                id: "project",
                label: "Best project",
                value: "Built Filler, a browser extension that fills repetitive application forms."
              }
            ],
            id: "projects",
            title: "Projects"
          }
        ]
      }
    }

    const prompt = buildPlannerPrompt(request)

    expect(prompt).toContain("Draft reviewable answers")
    expect(prompt).toContain("Use medium confidence")
    expect(prompt).toContain("Only skip")
  })

  it("tells the planner to draft reviewable preference, salary, and source answers", () => {
    const request: FillRequest = {
      fields: [
        {
          id: "field-0",
          tagName: "input",
          inputType: "text",
          labelText: "Do you have any salary expectations that we should be aware of?",
          required: true
        },
        {
          id: "field-1",
          tagName: "input",
          inputType: "radio",
          labelText: "Yes, 10 hours are ok"
        },
        {
          id: "field-2",
          tagName: "input",
          inputType: "text",
          labelText: "Where did you hear about this job posting?"
        }
      ],
      page: {
        headings: ["Startup application"],
        title: "Apply",
        url: "https://example.com/apply"
      },
      profile: {
        sections: [
          {
            fields: [
              {
                id: "startup",
                label: "Startup",
                value: "Solo technical founder building Filler after following founders on Twitter/X."
              }
            ],
            id: "startup",
            title: "Startup"
          }
        ]
      }
    }

    const prompt = buildPlannerPrompt(request)

    expect(prompt).toContain("preference-style questions")
    expect(prompt).toContain("salary expectations")
    expect(prompt).toContain("Where did you hear")
  })

  it("tells the planner to use graduation year for university year questions", () => {
    const request: FillRequest = {
      fields: [
        {
          id: "field-0",
          tagName: "input",
          inputType: "text",
          labelText: "What year did you graduate from university (college/bachelors degree)?"
        }
      ],
      page: {
        headings: ["Education"],
        title: "Apply",
        url: "https://example.com/apply"
      },
      profile: {
        sections: [
          {
            fields: [
              {
                id: "school",
                label: "School/University",
                value: "Gati Shakti Vishwavidyalaya"
              },
              {
                id: "graduation-year",
                label: "Graduation year",
                value: "2025"
              }
            ],
            id: "education",
            title: "Education"
          }
        ]
      }
    }

    const prompt = buildPlannerPrompt(request)

    expect(prompt).toContain("graduation year")
    expect(prompt).toContain("not the school or university name")
  })
})
