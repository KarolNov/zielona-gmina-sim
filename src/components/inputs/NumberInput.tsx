import { useEffect, useRef, useState } from 'react'
import type { ValidatorFn } from '../../lib/validators/valibot'

type NumberInputProps = {
  label?: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  validator?: ValidatorFn
  warning?: string | null
  name?: string
  decimal?: number
  id?: string
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  decimal,
  validator,
  warning,
  name,
  id
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(raw: string) {
    if (raw === '') return
    let parsed = Number(raw)
    if (Number.isNaN(parsed)) {
      setError('Wprowadź wartość liczbową')
      return
    }

    parsed = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed))
    
    if (decimal !== undefined) {
      const factor = 10 ** decimal
      parsed = Math.round(parsed * factor) / factor
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
    if (inputRef.current) {
      inputRef.current.value = String(parsed)
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(value)
    }
  }, [value])

  return (
    <div className="flex flex-col gap-2">
      {label ? <label htmlFor={id} className="text-sm font-medium text-(--sea-ink)">{label}</label> : null}
      <input
        id={id}
        name={name}
        type="number"
        defaultValue={value}
        onBlur={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && inputRef.current) {
            inputRef.current.blur()
          }
        }}
        ref={inputRef}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-md border border-(--chip-line) bg-(--chip-bg) px-3 py-2 text-(--sea-ink) shadow-sm focus:outline-none focus:ring-2 focus:ring-(--lagoon-deep)"
      />
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      {!error && warning ? <div className="text-xs text-amber-600">{warning}</div> : null}
    </div>
  )
}
