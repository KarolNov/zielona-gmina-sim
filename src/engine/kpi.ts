import { DISCOUNT_RATE } from "./constants";
import type { AnnualCashFlowRow } from "./types";

/**
 * Oblicza NPV (Net Present Value) — wartosc biezaca netto projektu.
 *
 * Formula: `NPV = sum(t=0..n)[CF_t / (1+r)^t]`
 *
 * NPV > 0 oznacza, ze projekt jest oplacalny przy danym koszcie kapitalu.
 * Im wyzsze NPV, tym bardziej oplacalna inwestycja.
 *
 * @param cashFlowTable - Tablica wierszy cash flow (od roku 0)
 * @param discountRate - Stopa dyskontowa / WACC (domyslnie 0.06)
 * @returns NPV w PLN
 *
 * @example
 * ```ts
 * const npv = calculateNPV(cashFlowTable, 0.06);
 * // => 150_000 (projekt oplacalny — NPV > 0)
 * ```
 */
export function calculateNPV(
  cashFlowTable: AnnualCashFlowRow[],
  discountRate: number = DISCOUNT_RATE,
): number {
  let npv = 0;

  for (const row of cashFlowTable) {
    npv += row.netCashFlow / Math.pow(1 + discountRate, row.year);
  }

  return npv;
}

/**
 * Oblicza IRR (Internal Rate of Return) — wewnetrzna stope zwrotu.
 *
 * IRR to stopa dyskontowa `r` dla ktorej NPV = 0:
 * `sum(t=0..n)[CF_t / (1+r)^t] = 0`
 *
 * IRR powinna byc wyzsza niz oprocentowanie lokat czy kredytu,
 * zeby inwestycja miala sens ekonomiczny.
 *
 * Uzywa metody Newtona-Raphsona z poczatkowym przyblizenien 10%.
 *
 * @param cashFlowTable - Tablica wierszy cash flow (od roku 0)
 * @returns IRR jako ulamek dziesietny (np. 0.12 = 12%). NaN jesli nie zbiega.
 *
 * @example
 * ```ts
 * const irr = calculateIRR(cashFlowTable);
 * // => 0.12 (12% wewnetrzna stopa zwrotu)
 * ```
 */
export function calculateIRR(
  cashFlowTable: AnnualCashFlowRow[],
): number {
  const cashFlows = cashFlowTable.map((row) => row.netCashFlow);
  const maxIterations = 100;
  const tolerance = 1e-6;
  let rate = 0.1; // Poczatkowe przyblizenie

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // Pochodna NPV po stopie

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      // Pochodna: d/dr [CF / (1+r)^t] = -t * CF / (1+r)^(t+1)
      if (t > 0) {
        dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (dnpv === 0) return NaN;

    // Newton-Raphson: r_new = r - f(r) / f'(r)
    rate = rate - npv / dnpv;

    // Zabezpieczenie przed ujemna stopa
    if (rate < -0.99) rate = -0.5;
  }

  return NaN;
}
