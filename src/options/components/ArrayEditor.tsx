import { type ReactNode } from "react"

export function ArrayEditor<T>({
  items,
  onChange,
  newItem,
  renderRow,
  addLabel = "Add"
}: {
  items: T[]
  onChange: (next: T[]) => void
  newItem: () => T
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode
  addLabel?: string
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {renderRow(item, i, (patch) => {
            const next = [...items]
            next[i] = { ...item, ...patch }
            onChange(next)
          })}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-3 text-xs text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
        + {addLabel}
      </button>
    </div>
  )
}
