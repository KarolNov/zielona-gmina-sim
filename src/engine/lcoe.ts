import { DISCOUNT_RATE, PROJECT_LIFETIME } from "./constants";
import { calculateOpexBreakdown, getInverterReplacementCost } from "./opex";
import { getAnnualProduction } from "./production";

/**
 * Oblicza LCOE (Levelized Cost of Energy) — zrownowazony koszt energii.
 *
 * Formula:
 * ```
 * LCOE = sum(t=0..n)[(CAPEX_t + OPEX_t + Inwerter_t) / (1+r)^t]
 *        ÷ sum(t=0..n)[E_gen_t / (1+r)^t]
 * ```
 *
 * - Licznik: CAPEX (rok 0, po dotacji) + zdyskontowane koszty OPEX (rok 1..n)
 *   + zdyskontowany koszt wymiany inwertera (rok 12)
 * - Mianownik: zdyskontowana calkowita produkcja energii (rok 1..n)
 *
 * @param capexAfterSubsidy - CAPEX netto po dotacji (PLN)
 * @param initialCapex - CAPEX brutto (PLN) — baza dla OPEX
 * @param pvPowerKwp - Moc zainstalowana (kWp)
 * @param annualYield - Roczny uzysk z PVGIS w kWh
 * @param degradacja - Roczna degradacja jako ulamek dziesietny
 * @param discountRate - Stopa dyskontowa / WACC (domyslnie 0.06)
 * @param lifetime - Okres zycia projektu w latach (domyslnie 25)
 * @returns LCOE w PLN/kWh
 */
export function calculateLCOE(
  capexAfterSubsidy: number,
  initialCapex: number,
  pvPowerKwp: number,
  annualYield: number,
  degradacja: number,
  discountRate: number = DISCOUNT_RATE,
  lifetime: number = PROJECT_LIFETIME,
): number {
  let costSum = capexAfterSubsidy;
  let energySum = 0;

  for (let t = 1; t <= lifetime; t++) {
    const discountFactor = Math.pow(1 + discountRate, t);
    const opex = calculateOpexBreakdown(initialCapex, pvPowerKwp, t - 1);
    const inverter = getInverterReplacementCost(pvPowerKwp, t);
    const energy = getAnnualProduction(annualYield, degradacja, t - 1);

    costSum += (opex.total + inverter) / discountFactor;
    energySum += energy / discountFactor;
  }

  if (energySum === 0) return Infinity;

  return costSum / energySum;
}
