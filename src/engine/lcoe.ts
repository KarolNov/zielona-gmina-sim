import { DISCOUNT_RATE, PROJECT_LIFETIME } from "./constants";
import { calculateOpex } from "./opex";
import { getAnnualProduction } from "./production";

/**
 * Oblicza LCOE (Levelized Cost of Energy) — zrownowazony koszt energii.
 *
 * Formula:
 * ```
 * LCOE = sum(t=0..n)[(CAPEX_t + OPEX_t) / (1+r)^t]
 *        ÷ sum(t=0..n)[E_gen_t / (1+r)^t]
 * ```
 *
 * - Licznik: CAPEX (rok 0, po dotacji) + zdyskontowane koszty OPEX (rok 1..n)
 * - Mianownik: zdyskontowana calkowita produkcja energii (rok 1..n)
 *
 * Wynik pokazuje realny koszt 1 kWh wyprodukowanej przez spoldzielnie —
 * powinien byc znacznie nizszy niz cena rynkowa energii z sieci.
 *
 * @param capexAfterSubsidy - CAPEX netto po dotacji (PLN)
 * @param initialCapex - CAPEX brutto (PLN) — baza dla OPEX
 * @param annualYield - Roczny uzysk z PVGIS w kWh (dla pelnej mocy instalacji)
 * @param degradacja - Roczna degradacja jako ulamek dziesietny
 * @param discountRate - Stopa dyskontowa / WACC (domyslnie 0.06)
 * @param lifetime - Okres zycia projektu w latach (domyslnie 25)
 * @returns LCOE w PLN/kWh
 *
 * @example
 * ```ts
 * // 100 kWp, uzysk 105_000 kWh/rok z PVGIS
 * const lcoe = calculateLCOE(200_000, 500_000, 105_000, 0.005);
 * // => ~0.25-0.35 PLN/kWh (znacznie ponizej ceny sieci ~0.85 PLN/kWh)
 * ```
 */
export function calculateLCOE(
  capexAfterSubsidy: number,
  initialCapex: number,
  annualYield: number,
  degradacja: number,
  discountRate: number = DISCOUNT_RATE,
  lifetime: number = PROJECT_LIFETIME,
): number {
  // Licznik: CAPEX w roku 0 + zdyskontowany OPEX
  let costSum = capexAfterSubsidy;

  // Mianownik: zdyskontowana produkcja
  let energySum = 0;

  for (let t = 1; t <= lifetime; t++) {
    const discountFactor = Math.pow(1 + discountRate, t);
    const opex = calculateOpex(initialCapex, t - 1);
    const energy = getAnnualProduction(annualYield, degradacja, t - 1);

    costSum += opex / discountFactor;
    energySum += energy / discountFactor;
  }

  if (energySum === 0) return Infinity;

  return costSum / energySum;
}
