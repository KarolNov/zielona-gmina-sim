import { getAutoconsumptionRate } from "./autoconsumption";
import { applySubsidy, calculateCapex } from "./capex";
import { buildCashFlowTable, calculatePaybackPeriod } from "./cashflow";
import { calculateIRR, calculateNPV } from "./kpi";
import { calculateLCOE } from "./lcoe";
import { calculateOpex } from "./opex";
import { getMonthlyProduction } from "./production";
import type { MonthlyProduction, SimulationInput, SimulationResult } from "./types";

// Re-eksport wszystkich funkcji i typow
export { getMonthlyProduction, getAnnualProduction } from "./production";
export { getAutoconsumptionRate } from "./autoconsumption";
export { calculateCapex, applySubsidy } from "./capex";
export { calculateOpex } from "./opex";
export { calculateLCOE } from "./lcoe";
export { buildCashFlowTable, calculatePaybackPeriod } from "./cashflow";
export { calculateNPV, calculateIRR } from "./kpi";
export type {
  SimulationInput,
  SimulationResult,
  AnnualCashFlowRow,
  MonthlyProduction,
  CapexResult,
} from "./types";
export {
  PROJECT_LIFETIME,
  DISCOUNT_RATE,
  CAPEX_TIERS,
  STORAGE_COST_PER_KWH,
  OPEX_RATE,
  OPEX_ESCALATION,
  BASE_AUTOCONSUMPTION,
  MAX_AUTOCONSUMPTION,
} from "./constants";

/**
 * Uruchamia pelna symulacje finansowa instalacji PV dla spoldzielni energetycznej.
 *
 * Orkiestrator laczacy wszystkie moduly silnika:
 * 1. Oblicza autokonsumpcje (rozmiar gminy + magazyn)
 * 2. Oblicza CAPEX (tiered pricing + magazyn) i naklada dotacje
 * 3. Buduje tabele cash flow rok po roku (25 lat)
 * 4. Oblicza KPI: LCOE, NPV, IRR, PBP
 * 5. Generuje produkcje miesieczna pierwszego roku
 *
 * @param input - Wszystkie parametry symulacji
 * @returns Pelne wyniki: KPI, tabela cash flow, produkcja miesieczna
 *
 * @example
 * ```ts
 * const result = runSimulation({
 *   pvPower: 100,
 *   degradacja: 0.005,
 *   cenaEnergii: 0.85,
 *   cenaSprzedazy: 0.4,
 *   inflacjaEnergii: 0.03,
 *   donation: 60,
 *   storageEnabled: true,
 *   storageCapacity: 50,
 *   communeSize: "medium",
 *   monthlyYields: [2500, 4500, 9000, ...], // z PVGIS dla 100 kWp
 *   annualYield: 105_000, // z PVGIS dla 100 kWp
 * });
 * // result.lcoe ≈ 0.25 PLN/kWh
 * // result.paybackYears ≈ 5
 * ```
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  // 1. Autokonsumpcja
  const autoconsumptionRate = getAutoconsumptionRate(
    input.communeSize,
    input.storageCapacity,
    input.pvPower,
  );

  // 2. CAPEX
  const { totalCapex, storageCost } = calculateCapex(
    input.pvPower,
    input.storageCapacity,
  );
  const capexAfterSubsidy = applySubsidy(totalCapex, input.donation);

  // 3. OPEX pierwszego roku (do wyswietlenia)
  const annualOpex = calculateOpex(totalCapex, 0);

  // 4. Tabela cash flow
  const cashFlowTable = buildCashFlowTable(
    input,
    capexAfterSubsidy,
    totalCapex,
    autoconsumptionRate,
  );

  // 5. KPI
  const paybackYears = calculatePaybackPeriod(cashFlowTable);
  const lcoe = calculateLCOE(
    capexAfterSubsidy,
    totalCapex,
    input.annualYield,
    input.degradacja,
  );
  const npv = calculateNPV(cashFlowTable);
  const irr = calculateIRR(cashFlowTable);

  // 6. Produkcja miesieczna w pierwszym roku
  const monthlyGenerated = getMonthlyProduction(
    input.monthlyYields,
    input.degradacja,
    0,
  );
  const monthlyProductionYear1: MonthlyProduction[] = monthlyGenerated.map(
    (generated, i) => ({
      month: i,
      generated,
      selfConsumed: generated * autoconsumptionRate,
      exported: generated * (1 - autoconsumptionRate),
    }),
  );

  return {
    capex: totalCapex,
    capexAfterSubsidy,
    storageCost,
    annualOpex,
    autoconsumptionRate,
    lcoe,
    npv,
    irr,
    paybackYears,
    cashFlowTable,
    monthlyProductionYear1,
  };
}
