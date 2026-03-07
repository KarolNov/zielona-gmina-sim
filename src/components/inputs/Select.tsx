// Simple select input used across the app

type Option = {
  value: string
  label: string
}

type SelectProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  name?: string
}

export default function Select({
  label,
  value,
  onChange,
  options,
  name,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
  {label ? <label className="text-sm font-medium text-(--sea-ink)">{label}</label> : null}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-(--sea-ink) shadow-sm focus:outline-none focus:ring-2 focus:ring-(--lagoon-deep)"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
