import { NET_METERING_RATIO, PROJECT_LIFETIME } from "./constants";
import { calculateOpexBreakdown } from "./opex";
import { getAnnualProduction } from "./production";
import type { AnnualCashFlowRow, OpexBreakdown, SimulationInput } from "./types";

const ZERO_OPEX_BREAKDOWN: OpexBreakdown = {
  servicing: 0,
  insurance: 0,
  repairs: 0,
  monitoring: 0,
  inverterReserve: 0,
  total: 0,
};

/** Konwersja MWh -> kWh */
const MWH_TO_KWH = 1000;

/**
 * Generuje tabele przeplywow pienieznych rok po roku na caly okres zycia projektu.
 *
 * Tabela uwzglednia perspektywe wlasciciela:
 * - Rok 0: wyplyw wkladu wlasnego (CAPEX po dotacji minus czesc kredytowana)
 * - Rok 1..n: oszczednosci + eksport - OPEX - wymiana inwertera - rata kredytu
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
    prosumerSurcharge: 0,
    residualImport: 0,
    opex: 0,
    opexBreakdown: ZERO_OPEX_BREAKDOWN,
    loanPayment: 0,
    netCashFlow: -ownContribution,
    cumulativeCashFlow: -ownContribution,
    gridPrice: input.cenaEnergii,
    exportPrice: NET_METERING_RATIO * input.cenaEnergiiImport,
  });

  const annualDemandKwh = input.annualDemand * MWH_TO_KWH;

  for (let year = 1; year <= lifetime; year++) {
    const prevCumulative = rows[year - 1].cumulativeCashFlow;

    const energyGenerated = getAnnualProduction(
      input.annualYield,
      input.degradacja,
      year - 1,
    );

    // Self-consumption capped by actual demand (cannot consume more than you use)
    const rawSelfConsumed = energyGenerated * autoconsumptionRate;
    const energySelfConsumed = Math.min(rawSelfConsumed, annualDemandKwh);
    const energyExported = energyGenerated - energySelfConsumed;

    const gridPrice =
      input.cenaEnergii * (1 + input.inflacjaEnergii) ** (year - 1);
    const importPrice =
      input.cenaEnergiiImport * (1 + input.inflacjaEnergii) ** (year - 1);
    // Opust 1:0,6 (Ustawa o OZE art. 38c): za kazdy 1 kWh eksportu
    // mozna odebrac NET_METERING_RATIO kWh bezplatnie po cenie importowej
    const exportPrice = NET_METERING_RATIO * importPrice;

    // Net-metering kombinowany z surcharge prosumenckim:
    // - PV pokrywa zuzycie do energySelfConsumed (oszczedza po cenie bazowej)
    // - Opust pokrywa do opustCreditUsed kWh (oszczedza po cenie bazowej)
    // - Reszta zapotrzebowania kupowana po cenie prosumenckiej (z narzutem)
    const opustCreditAvailable = NET_METERING_RATIO * energyExported;
    const residualAfterSelf = Math.max(
      0,
      annualDemandKwh - energySelfConsumed,
    );
    const opustCreditUsed = Math.min(opustCreditAvailable, residualAfterSelf);
    const residualImport = residualAfterSelf - opustCreditUsed;

    // Oszczednosc = unikniety koszt zakupu energii po cenie bazowej (bez PV)
    const savings = energySelfConsumed * gridPrice;
    // Opust przelicza na unikniety koszt po cenie bazowej (energia z sieci za darmo)
    const exportRevenue = opustCreditUsed * gridPrice;
    // Narzut prosumencki — kara nakladana na rezydualny import
    const prosumerSurcharge = residualImport * (importPrice - gridPrice);

    const opexBreakdown = calculateOpexBreakdown(
      initialCapex,
      input.pvPower,
      year - 1,
    );
    const loanPayment = year <= loanTerm ? loanAnnualPayment : 0;

    const netCashFlow =
      savings +
      exportRevenue -
      prosumerSurcharge -
      opexBreakdown.total -
      loanPayment;
    const cumulativeCashFlow = prevCumulative + netCashFlow;

    rows.push({
      year,
      energyGenerated,
      energySelfConsumed,
      energyExported,
      savings,
      exportRevenue,
      prosumerSurcharge,
      residualImport,
      opex: opexBreakdown.total,
      opexBreakdown,
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
