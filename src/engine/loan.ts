/**
 * Oblicza roczna rate kredytu annuitetowego (rownomierna rata).
 *
 * Formula:
 * ```
 * PMT = P × r × (1+r)^n / ((1+r)^n - 1)
 * ```
 *
 * @param principal - Kwota kredytu (PLN)
 * @param annualRate - Roczna stopa procentowa jako ulamek dziesietny (np. 0.07 = 7%)
 * @param years - Okres kredytu w latach
 * @returns Roczna rata kredytu (PLN). 0 jesli principal <= 0 lub years <= 0.
 *
 * @example
 * ```ts
 * calculateAnnualPayment(100_000, 0.07, 15);
 * // => ~10 979 PLN/rok
 * ```
 */
export function calculateAnnualPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / years; // kredyt bezodsetkowy

  const r = annualRate;
  const n = years;
  const factor = Math.pow(1 + r, n);

  return principal * (r * factor) / (factor - 1);
}
