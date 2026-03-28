import { OPEX_ESCALATION, OPEX_RATE } from "./constants";

/**
 * Oblicza roczne koszty operacyjne (OPEX) dla danego roku projektu.
 *
 * OPEX stanowi procent poczatkowego CAPEX i rosnie rocznie
 * o wspolczynnik eskalacji (inflacja kosztow serwisu, ubezpieczen itp.).
 *
 * Formula: `OPEX(t) = CAPEX_initial × opexRate × (1 + eskalacja)^t`
 *
 * @param initialCapex - Calkowity CAPEX (przed dotacja) w PLN — baza do obliczen OPEX
 * @param year - Rok projektu (0 = pierwszy rok eksploatacji)
 * @param opexRate - OPEX jako ulamek CAPEX rocznie (domyslnie 0.015 = 1.5%)
 * @param opexEscalation - Roczna eskalacja OPEX (domyslnie 0.02 = 2%)
 * @returns Koszt OPEX w danym roku (PLN)
 *
 * @example
 * ```ts
 * calculateOpex(500_000, 0);
 * // => 500_000 * 0.015 * (1.02)^0 = 7_500 PLN
 *
 * calculateOpex(500_000, 10);
 * // => 500_000 * 0.015 * (1.02)^10 ≈ 9_142 PLN
 * ```
 */
export function calculateOpex(
  initialCapex: number,
  year: number,
  opexRate: number = OPEX_RATE,
  opexEscalation: number = OPEX_ESCALATION,
): number {
  return initialCapex * opexRate * Math.pow(1 + opexEscalation, year);
}
