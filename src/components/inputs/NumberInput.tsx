import { useState } from 'react'
import type { ValidatorFn } from '../../lib/validators/valibot'

type NumberInputProps = {
  label?: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  validator?: ValidatorFn
  name?: string
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  validator,
  name,
}: NumberInputProps) {
  const [error, setError] = useState<string | null>(null)

  function handleChange(raw: string) {
    const parsed = raw === '' ? NaN : Number(raw)
    if (Number.isNaN(parsed)) {
      setError('Wprowadź wartość liczbową')
      return
    }

    if (min !== undefined && parsed < min) {
      setError(`Minimalna wartość to ${min}`)
      return
    }

    if (max !== undefined && parsed > max) {
      setError(`Maksymalna wartość to ${max}`)
      return
    }

    if (validator) {
      const res = validator(parsed)
      if (res !== true) {
        setError(typeof res === 'string' ? res : 'Nieprawidłowa wartość')
        return
      }
    }

    setError(null)
    onChange(parsed)
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? <label className="text-sm font-medium text-(--sea-ink)">{label}</label> : null}
      <input
        name={name}
        type="number"
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => handleChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-md border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-(--sea-ink) shadow-sm focus:outline-none focus:ring-2 focus:ring-(--lagoon-deep)"
      />
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  )
}
