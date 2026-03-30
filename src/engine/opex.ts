import {
  INVERTER_REPLACEMENT_PER_KWP,
  INVERTER_REPLACEMENT_YEAR,
  MAINTENANCE_ESCALATION,
  MAINTENANCE_INSURANCE_RATE,
  MAINTENANCE_MONITORING_FLAT,
  MAINTENANCE_REPAIRS_RATE,
  MAINTENANCE_SERVICING_PER_KWP,
} from "./constants";
import type { OpexBreakdown } from "./types";

/**
 * Oblicza szczegolowe roczne koszty operacyjne (OPEX) dla danego roku projektu.
 *
 * Skladniki:
 * - Serwisowanie / czyszczenie — proporcjonalnie do mocy (PLN/kWp)
 * - Ubezpieczenie — procent CAPEX brutto
 * - Naprawy — procent CAPEX brutto
 * - Monitoring — stala kwota roczna
 *
 * Kazdy skladnik podlega rocznej eskalacji (inflacja).
 *
 * @param initialCapex - CAPEX brutto (PLN) — baza dla skladnikow procentowych
 * @param pvPowerKwp - Moc zainstalowana (kWp) — baza dla skladnikow per-kWp
 * @param year - Rok eksploatacji (0 = pierwszy rok)
 * @param escalation - Roczna eskalacja kosztow (domyslnie 2%)
 * @returns Rozbicie OPEX na skladniki z suma
 */
export function calculateOpexBreakdown(
  initialCapex: number,
  pvPowerKwp: number,
  year: number,
  escalation: number = MAINTENANCE_ESCALATION,
): OpexBreakdown {
  const esc = Math.pow(1 + escalation, year);

  const servicing = pvPowerKwp * MAINTENANCE_SERVICING_PER_KWP * esc;
  const insurance = initialCapex * MAINTENANCE_INSURANCE_RATE * esc;
  const repairs = initialCapex * MAINTENANCE_REPAIRS_RATE * esc;
  const monitoring = MAINTENANCE_MONITORING_FLAT * esc;

  return {
    servicing,
    insurance,
    repairs,
    monitoring,
    total: servicing + insurance + repairs + monitoring,
  };
}

/**
 * Zwraca calkowity OPEX (suma skladnikow) — wrapper kompatybilny wstecz.
 *
 * @deprecated Uzyj `calculateOpexBreakdown` dla pelnego rozbicia.
 */
export function calculateOpex(
  initialCapex: number,
  pvPowerKwp: number,
  year: number,
  escalation: number = MAINTENANCE_ESCALATION,
): number {
  return calculateOpexBreakdown(initialCapex, pvPowerKwp, year, escalation)
    .total;
}

/**
 * Zwraca koszt wymiany inwertera jesli dany rok to rok wymiany, w przeciwnym razie 0.
 *
 * @param pvPowerKwp - Moc zainstalowana (kWp)
 * @param year - Rok projektu (1-based, rok 1 = pierwszy rok eksploatacji)
 * @param replacementYear - Rok wymiany (domyslnie 12)
 * @returns Koszt wymiany w PLN (0 poza rokiem wymiany)
 */
export function getInverterReplacementCost(
  pvPowerKwp: number,
  year: number,
  replacementYear: number = INVERTER_REPLACEMENT_YEAR,
): number {
  return year === replacementYear
    ? pvPowerKwp * INVERTER_REPLACEMENT_PER_KWP
    : 0;
}
