import { useState } from "react"

import {
  SHORT_FIELD_COUNT,
  SHORT_FIELDS_SECONDS
} from "~components/landing/fill-race"
import { trackEvent } from "~lib/analytics"

const LONG_ANSWER_SECONDS = 150 // 100 words at 40 words a minute
const APPLICATION_OPTIONS = [5, 10, 20, 40] as const
const LONG_ANSWER_OPTIONS = [0, 1, 2, 3] as const

function formatDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

function BubbleRow<T extends number>({
  legend,
  name,
  onChange,
  options,
  value
}: {
  legend: string
  name: string
  onChange: (value: T) => void
  options: readonly T[]
  value: T
}) {
  return (
    <fieldset className="sheet-grid-row">
      <legend>{legend}</legend>
      <div className="sheet-grid-options">
        {options.map((option) => (
          <label className="sheet-grid-option" key={option}>
            <input
              checked={value === option}
              name={name}
              onChange={() => onChange(option)}
              type="radio"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function TimeSheet() {
  const [applications, setApplications] = useState<number>(20)
  const [longAnswers, setLongAnswers] = useState<number>(1)

  const perApplication =
    SHORT_FIELDS_SECONDS + longAnswers * LONG_ANSWER_SECONDS
  const total = applications * perApplication

  return (
    <div className="sheet-timesheet">
      <form
        className="sheet-grid"
        onSubmit={(event) => event.preventDefault()}>
        <BubbleRow
          legend="Applications a week"
          name="applications"
          onChange={(value) => {
            setApplications(value)
            trackEvent("time_sheet_change", {
              applications: String(value),
              longAnswers: String(longAnswers)
            })
          }}
          options={APPLICATION_OPTIONS}
          value={applications as (typeof APPLICATION_OPTIONS)[number]}
        />
        <BubbleRow
          legend="Long answers on each one"
          name="long-answers"
          onChange={(value) => {
            setLongAnswers(value)
            trackEvent("time_sheet_change", {
              applications: String(applications),
              longAnswers: String(value)
            })
          }}
          options={LONG_ANSWER_OPTIONS}
          value={longAnswers as (typeof LONG_ANSWER_OPTIONS)[number]}
        />
      </form>
      <div aria-live="polite" className="sheet-result">
        <p className="sheet-result-time">{formatDuration(total)}</p>
        <p className="sheet-result-label">of typing a week</p>
        <p className="sheet-result-math">
          {applications} applications × ({SHORT_FIELDS_SECONDS} s for{" "}
          {SHORT_FIELD_COUNT} short fields
          {longAnswers > 0
            ? ` + ${longAnswers} × 2.5 min for a 100-word answer`
            : ""}
          ), at 40 words a minute.
        </p>
      </div>
    </div>
  )
}
