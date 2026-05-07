import {
  INVERTER_REPLACEMENT_PER_KWP,
  MAINTENANCE_ESCALATION,
  MAINTENANCE_INSURANCE_RATE,
  MAINTENANCE_MONITORING_FLAT,
  MAINTENANCE_REPAIRS_RATE,
  MAINTENANCE_SERVICING_PER_KWP,
  PROJECT_LIFETIME,
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
 * - Rezerwa na wymiane inwertera — amortyzowany koszt wymiany rozlozony
 *   na caly okres zycia projektu (sinking fund), bez eskalacji.
 *
 * Skladniki utrzymania (poza rezerwa) podlegaja rocznej eskalacji.
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
  const inverterReserve =
    (pvPowerKwp * INVERTER_REPLACEMENT_PER_KWP) / PROJECT_LIFETIME;

  return {
    servicing,
    insurance,
    repairs,
    monitoring,
    inverterReserve,
    total: servicing + insurance + repairs + monitoring + inverterReserve,
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
