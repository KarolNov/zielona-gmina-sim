import { PROJECT_LIFETIME } from "./constants";
import { calculateOpex } from "./opex";
import { getAnnualProduction } from "./production";
import type { AnnualCashFlowRow, SimulationInput } from "./types";

/**
 * Generuje tabele przeplywow pienieznych rok po roku na caly okres zycia projektu.
 *
 * Struktura:
 * - Rok 0: wyplyw CAPEX (po dotacji), brak produkcji
 * - Rok 1..n: oszczednosci z autokonsumpcji + przychod z eksportu - OPEX
 *
 * Uwzglednia:
 * - Degradacje paneli (malejaca produkcja r/r)
 * - Inflacje cen energii (rosnace ceny zakupu i sprzedazy r/r)
 * - Eskalacje OPEX
 * - Kumulatywny cash flow do okreslenia PBP
 *
 * @param input - Parametry symulacji (moc, ceny, degradacja, inflacja, uzyski PVGIS)
 * @param capexAfterSubsidy - CAPEX netto po dotacji (PLN)
 * @param initialCapex - CAPEX brutto przed dotacja (PLN) — baza dla OPEX
 * @param autoconsumptionRate - Wspolczynnik autokonsumpcji (0..1)
 * @param lifetime - Okres zycia projektu w latach (domyslnie 25)
 * @returns Tablica wierszy cash flow dla lat 0..lifetime
 *
 * @example
 * ```ts
 * const table = buildCashFlowTable(input, 200_000, 500_000, 0.4, 25);
 * // table[0].netCashFlow === -200_000 (inwestycja)
 * // table[1].savings > 0 (oszczednosci z autokonsumpcji)
 * ```
 */
export function buildCashFlowTable(
  input: SimulationInput,
  capexAfterSubsidy: number,
  initialCapex: number,
  autoconsumptionRate: number,
  lifetime: number = PROJECT_LIFETIME,
): AnnualCashFlowRow[] {
  const rows: AnnualCashFlowRow[] = [];

  // Rok 0 — inwestycja
  rows.push({
    year: 0,
    energyGenerated: 0,
    energySelfConsumed: 0,
    energyExported: 0,
    savings: 0,
    exportRevenue: 0,
    opex: 0,
    netCashFlow: -capexAfterSubsidy,
    cumulativeCashFlow: -capexAfterSubsidy,
    gridPrice: input.cenaEnergii,
    exportPrice: input.cenaSprzedazy,
  });

  // Lata eksploatacji 1..lifetime
  for (let year = 1; year <= lifetime; year++) {
    const prevCumulative = rows[year - 1].cumulativeCashFlow;

    // Produkcja z degradacja (year-1 bo rok 1 = pierwszy rok eksploatacji = 0 lat degradacji)
    const energyGenerated = getAnnualProduction(
      input.annualYield,
      input.degradacja,
      year - 1,
    );

    const energySelfConsumed = energyGenerated * autoconsumptionRate;
    const energyExported = energyGenerated - energySelfConsumed;

    // Ceny z inflacja (year-1 bo rok 1 = cena bazowa bez inflacji)
    const gridPrice =
      input.cenaEnergii * Math.pow(1 + input.inflacjaEnergii, year - 1);
    const exportPrice =
      input.cenaSprzedazy * Math.pow(1 + input.inflacjaEnergii, year - 1);

    const savings = energySelfConsumed * gridPrice;
    const exportRevenue = energyExported * exportPrice;
    const opex = calculateOpex(initialCapex, year - 1);

    const netCashFlow = savings + exportRevenue - opex;
    const cumulativeCashFlow = prevCumulative + netCashFlow;

    rows.push({
      year,
      energyGenerated,
      energySelfConsumed,
      energyExported,
      savings,
      exportRevenue,
      opex,
      netCashFlow,
      cumulativeCashFlow,
      gridPrice,
      exportPrice,
    });
  }

  return rows;
}

/**
 * Oblicza prosty czas zwrotu inwestycji (PBP / SPBT).
 *
 * Formula prosta: `PBP = TC / S_t` (koszt calkowity / roczne oszczednosci).
 * Poniewaz oszczednosci zmieniaja sie rok po roku (inflacja, degradacja),
 * stosujemy interpolacje liniowa na kumulatywnym cash flow:
 *
 * `PBP = rokPrzed + |cumPrzed| / (cumPo - cumPrzed)`
 *
 * @param cashFlowTable - Tablica wierszy cash flow (z roku 0)
 * @returns Czas zwrotu w latach (ulamkowy). Infinity jesli nie osiagniety w lifetime.
 *
 * @example
 * ```ts
 * const pbp = calculatePaybackPeriod(cashFlowTable);
 * // => 8.3 (zwrot po ~8 latach i 4 miesiacach)
 * ```
 */
export function calculatePaybackPeriod(
  cashFlowTable: AnnualCashFlowRow[],
): number {
  for (let i = 1; i < cashFlowTable.length; i++) {
    if (cashFlowTable[i].cumulativeCashFlow >= 0) {
      const prev = cashFlowTable[i - 1].cumulativeCashFlow;
      const curr = cashFlowTable[i].cumulativeCashFlow;

      // Interpolacja liniowa
      const fraction = Math.abs(prev) / (curr - prev);
      return cashFlowTable[i - 1].year + fraction;
    }
  }

  return Infinity;
}
