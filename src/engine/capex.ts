import { CAPEX_TIERS, STORAGE_COST_PER_KWH } from "./constants";
import type { CapexResult } from "./types";

/**
 * Oblicza calkowite naklady inwestycyjne (CAPEX) instalacji PV.
 *
 * Stosuje progowe ceny jednostkowe — wieksze instalacje maja nizszy
 * koszt za kWp dzieki efektowi skali:
 * - mikroinstalacje (do 50 kW): 4 100 PLN/kWp
 * - male i srednie instalacje (50 kW – 1 MW): 3 100 PLN/kWp
 * - farmy przemyslowe (powyzej 1 MW): 2 400 PLN/kWp
 *
 * Opcjonalnie dolicza koszt magazynu energii.
 *
 * @param pvPower - Moc zainstalowana w kWp
 * @param storageCapacity - Pojemnosc magazynu w kWh (0 jesli brak magazynu)
 * @returns Obiekt z rozbiciem kosztow: pvCost, storageCost, totalCapex
 *
 * @example
 * ```ts
 * calculateCapex(100, 50);
 * // => { pvCost: 450_000, storageCost: 125_000, totalCapex: 575_000 }
 * ```
 */
export function calculateCapex(
  pvPower: number,
  storageCapacity: number,
): CapexResult {
  const tier = CAPEX_TIERS.find((t) => pvPower <= t.maxKwp) ?? CAPEX_TIERS[CAPEX_TIERS.length - 1];
  const pvCost = pvPower * tier.costPerKwp;
  const storageCost = storageCapacity * STORAGE_COST_PER_KWH;

  return {
    pvCost,
    storageCost,
    totalCapex: pvCost + storageCost,
  };
}

/**
 * Naklada dofinansowanie (dotacje) na calkowity CAPEX.
 *
 * @param totalCapex - Calkowity CAPEX przed dotacja (PLN)
 * @param donationPct - Dofinansowanie jako procent (0-100)
 * @returns CAPEX netto po odliczeniu dotacji (PLN)
 *
 * @example
 * ```ts
 * applySubsidy(500_000, 60);
 * // => 200_000 (60% dotacji)
 * ```
 */
export function applySubsidy(totalCapex: number, donationPct: number): number {
  return totalCapex * (1 - donationPct / 100);
}
