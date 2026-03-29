import { PROJECT_LIFETIME } from "./constants";
import { calculateOpex } from "./opex";
import { getAnnualProduction } from "./production";
import type { AnnualCashFlowRow, SimulationInput } from "./types";

/**
 * Generuje tabele przeplywow pienieznych rok po roku na caly okres zycia projektu.
 *
 * Tabela uwzglednia perspektywe wlasciciela:
 * - Rok 0: wyplyw wkladu wlasnego (CAPEX po dotacji minus czesc kredytowana)
 * - Rok 1..n: oszczednosci + eksport - OPEX - rata kredytu
 *
 * @param input - Parametry symulacji
 * @param capexAfterSubsidy - CAPEX netto po dotacji (PLN)
 * @param initialCapex - CAPEX brutto (PLN) — baza dla OPEX
 * @param autoconsumptionRate - Wspolczynnik autokonsumpcji (0..1)
 * @param loanAnnualPayment - Roczna rata kredytu (PLN), 0 jesli brak
 * @param loanTerm - Okres kredytu w latach, 0 jesli brak
 * @param lifetime - Okres zycia projektu (domyslnie 25)
 */
export function buildCashFlowTable(
  input: SimulationInput,
  capexAfterSubsidy: number,
  initialCapex: number,
  autoconsumptionRate: number,
  loanAnnualPayment: number = 0,
  loanTerm: number = 0,
  lifetime: number = PROJECT_LIFETIME,
): AnnualCashFlowRow[] {
  const rows: AnnualCashFlowRow[] = [];

  // Rok 0 — wklad wlasny (CAPEX minus czesc kredytowana)
  const ownContribution = input.loanEnabled
    ? capexAfterSubsidy * (1 - input.loanShare / 100)
    : capexAfterSubsidy;

  rows.push({
    year: 0,
    energyGenerated: 0,
    energySelfConsumed: 0,
    energyExported: 0,
    savings: 0,
    exportRevenue: 0,
    opex: 0,
    loanPayment: 0,
    netCashFlow: -ownContribution,
    cumulativeCashFlow: -ownContribution,
    gridPrice: input.cenaEnergii,
    exportPrice: input.cenaSprzedazy,
  });

  for (let year = 1; year <= lifetime; year++) {
    const prevCumulative = rows[year - 1].cumulativeCashFlow;

    const energyGenerated = getAnnualProduction(
      input.annualYield,
      input.degradacja,
      year - 1,
    );

    const energySelfConsumed = energyGenerated * autoconsumptionRate;
    const energyExported = energyGenerated - energySelfConsumed;

    const gridPrice =
      input.cenaEnergii * (1 + input.inflacjaEnergii) ** (year - 1);
    const exportPrice =
      input.cenaSprzedazy * (1 + input.inflacjaEnergii) ** (year - 1);

    const savings = energySelfConsumed * gridPrice;
    const exportRevenue = energyExported * exportPrice;
    const opex = calculateOpex(initialCapex, year - 1);
    const loanPayment = year <= loanTerm ? loanAnnualPayment : 0;

    const netCashFlow = savings + exportRevenue - opex - loanPayment;
    const cumulativeCashFlow = prevCumulative + netCashFlow;

    rows.push({
      year,
      energyGenerated,
      energySelfConsumed,
      energyExported,
      savings,
      exportRevenue,
      opex,
      loanPayment,
      netCashFlow,
      cumulativeCashFlow,
      gridPrice,
      exportPrice,
    });
  }

  return rows;
}

/**
 * Oblicza czas zwrotu inwestycji z interpolacja liniowa.
 *
 * Liczy na bazie skumulowanych przeplywow z tabeli cash flow.
 * Tabela juz zawiera perspektywe wlasciciela (z ratami kredytu).
 *
 * @param cashFlowTable - Tablica wierszy cash flow (rok 0..n)
 * @returns Czas zwrotu w latach (ulamkowy). Infinity jesli nie osiagniety.
 */
export function calculatePaybackPeriod(
  cashFlowTable: AnnualCashFlowRow[],
): number {
  for (let i = 1; i < cashFlowTable.length; i++) {
    if (cashFlowTable[i].cumulativeCashFlow >= 0) {
      const prev = cashFlowTable[i - 1].cumulativeCashFlow;
      const curr = cashFlowTable[i].cumulativeCashFlow;
      const fraction = Math.abs(prev) / (curr - prev);
      return cashFlowTable[i - 1].year + fraction;
    }
  }
  return Infinity;
}
