type Option = {
  value: string
  label: string
}

type SelectProps<T extends string> =  {
  label?: string
  value: T
  onChange: (value: T) => void
  options: Option[]
  name?: string
  id: string
}

export default function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  name,
  id
}: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-2">
  {label ? <label htmlFor={id} className="text-sm font-medium text-(--sea-ink)">{label}</label> : null}
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full rounded-md border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-(--sea-ink) shadow-sm focus:outline-none focus:ring-2 focus:ring-(--lagoon-deep)"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
