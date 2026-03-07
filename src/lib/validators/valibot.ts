export type ValidatorFn = (value: number) => true | string

// Lightweight wrapper: if valibot is available, you can build schemas and
// provide a function here. For now, we provide a simple range validator helper.

export function rangeValidator(min?: number, max?: number): ValidatorFn {
  return (value: number) => {
    if (min !== undefined && value < min) return `Minimalna wartość to ${min}`
    if (max !== undefined && value > max) return `Maksymalna wartość to ${max}`
    return true
  }
}
