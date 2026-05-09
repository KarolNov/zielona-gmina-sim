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
 * - Kazdy kWh magazynu na 1 kWp mocy dodaje ~20 punktow procentowych
 * - Wynik ograniczony do min(MAX_AUTOCONSUMPTION, D/E_1)
 *
 * Cap D/E_1 zapewnia, ze autokonsumpcja nie przekroczy fizycznego
 * zapotrzebowania gminy — jesli produkcja PV przewyzsza zuzycie,
 * nadwyzka musi trafic do sieci niezaleznie od magazynu.
 *
 * @param communeSize - Kategoria rozmiaru gminy
 * @param storageCapacity - Pojemnosc magazynu energii w kWh (0 jesli brak)
 * @param pvPower - Moc zainstalowana w kWp
 * @param annualDemand - Roczne zapotrzebowanie gminy na energie (MWh/rok)
 * @param annualYield - Roczna produkcja energii z PV (kWh/rok)
 * @returns Wspolczynnik autokonsumpcji w zakresie 0..MAX_AUTOCONSUMPTION
 *
 * @example
 * ```ts
 * // Mala gmina, 50 kWp, magazyn 25 kWh, zapotrzebowanie 200 MWh, produkcja 50000 kWh
 * getAutoconsumptionRate("small", 25, 50, 200, 50000);
 * // => min(0.9, 0.30 + 0.10, 200000/50000) = 0.40
 * ```
 */
export function getAutoconsumptionRate(
  communeSize: CommuneType,
  storageCapacity: number,
  pvPower: number,
  annualDemand: number,
  annualYield: number,
): number {
  if (pvPower <= 0) return 0;

  const baseRate = BASE_AUTOCONSUMPTION[communeSize] ?? 0.3;
  const storageBoost =
    (storageCapacity / pvPower) *
    STORAGE_AUTOCONSUMPTION_BOOST_PER_KWH_PER_KWP;

  const demandCap =
    annualYield > 0 ? (annualDemand * 1000) / annualYield : MAX_AUTOCONSUMPTION;

  return Math.min(baseRate + storageBoost, MAX_AUTOCONSUMPTION, demandCap);
}
