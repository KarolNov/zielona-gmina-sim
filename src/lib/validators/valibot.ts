import * as v from "valibot"

export type ValidatorFn = (value: number) => true | string

export const valibotValidator = (schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>): ValidatorFn => {
  return (value: number) => {
    const res = v.safeParse(schema, value)
    if (res.success) return true
    return res.issues.map(issue => issue.message).join(", ")
  }
}