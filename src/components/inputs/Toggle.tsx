// Toggle input component

type ToggleProps = {
  label?: string
  checked: boolean
  onChange: (next: boolean) => void
  name?: string
}

export default function Toggle({ label, checked, onChange, name }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      {label ? <span className="text-sm font-medium text-(--sea-ink)">{label}</span> : null}
      <div className="relative group shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          aria-hidden
          className="w-9 h-5 flex items-center rounded-full transition-colors duration-200 bg-(--chip-line) peer-checked:bg-(--lagoon-deep) px-0.5"
        >
          <div
            className="w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 group-has-checked:translate-x-4"
          />
        </div>
      </div>
    </label>
  )
}
