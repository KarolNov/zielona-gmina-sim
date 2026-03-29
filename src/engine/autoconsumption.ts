import type { CommuneType } from "#/lib/types";
import {
  BASE_AUTOCONSUMPTION,
  MAX_AUTOCONSUMPTION,
  STORAGE_AUTOCONSUMPTION_BOOST_PER_KWH_PER_KWP,
} from "./constants";

/**
 * Zwraca ulamek wygenerowanej energii zuzywanej na miejscu (autokonsumpcja).
 *
 * Model uproszczony (bez symulacji godzinowej):
 * - Baza zalezy od rozmiaru gminy: SMALL=30%, MEDIUM=40%, LARGE=50%
 * - Kazdy kWh magazynu na 1 kWp mocy dodaje ~8 punktow procentowych
 * - Wynik ograniczony do maksymalnie 90%
 *
 * Wieksze gminy maja wyzszy bazowy wspolczynnik, poniewaz dysponuja
 * wiekszym obciazeniem dziennym (szkoly, urzedy, pompownie wodociagowe).
 *
 * @param communeSize - Kategoria rozmiaru gminy
 * @param storageCapacity - Pojemnosc magazynu energii w kWh (0 jesli brak)
 * @param pvPower - Moc zainstalowana w kWp
 * @returns Wspolczynnik autokonsumpcji w zakresie 0..MAX_AUTOCONSUMPTION
 *
 * @example
 * ```ts
 * // Mala gmina, 50 kWp, magazyn 25 kWh (0.5 kWh/kWp)
 * getAutoconsumptionRate("small", 25, 50);
 * // => 0.30 + (25/50) * 0.20 = 0.40
 *
 * // Duza gmina, 100 kWp, magazyn 100 kWh (1 kWh/kWp)
 * getAutoconsumptionRate("large", 100, 100);
 * // => 0.50 + (100/100) * 0.20 = 0.70
 * ```
 */
export function getAutoconsumptionRate(
  communeSize: CommuneType,
  storageCapacity: number,
  pvPower: number,
): number {
  if (pvPower <= 0) return 0;

  const baseRate = BASE_AUTOCONSUMPTION[communeSize] ?? 0.3;
  const storageBoost =
    (storageCapacity / pvPower) *
    STORAGE_AUTOCONSUMPTION_BOOST_PER_KWH_PER_KWP;

  return Math.min(baseRate + storageBoost, MAX_AUTOCONSUMPTION);
}
