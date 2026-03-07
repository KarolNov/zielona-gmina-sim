// Toggle input component

type ToggleProps = {
  label?: string
  checked: boolean
  onChange: (next: boolean) => void
  name?: string
}

export default function Toggle({ label, checked, onChange, name }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3">
      <div className="flex flex-col gap-4">
        {label ? <span className="text-sm font-medium text-(--sea-ink)">{label}</span> : null}
        <div className="relative group">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <div
            aria-hidden
            className={`w-12 h-fit flex p-1 rounded-full transition-colors duration-200 bg-(--chip-line) peer-checked:bg-(--lagoon-deep)`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 group-has-checked:translate-x-5`}
            />
          </div>
        </div>
      </div>
    </label>
  )
}
