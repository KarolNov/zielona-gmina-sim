import { getAutoconsumptionRate } from "./autoconsumption";
import { applySubsidy, calculateCapex } from "./capex";
import { buildCashFlowTable, calculatePaybackPeriod } from "./cashflow";
import { DISCOUNT_RATE } from "./constants";
import { calculateIRR, calculateNPV } from "./kpi";
import { calculateLCOE } from "./lcoe";
import { calculateAnnualPayment } from "./loan";
import { calculateOpex } from "./opex";
import { getMonthlyProduction } from "./production";
import type {
  MonthlyProduction,
  SimulationInput,
  SimulationResult,
} from "./types";

// Re-eksport
export { getMonthlyProduction, getAnnualProduction } from "./production";
export { getAutoconsumptionRate } from "./autoconsumption";
export { calculateCapex, applySubsidy } from "./capex";
export { calculateOpex } from "./opex";
export { calculateLCOE } from "./lcoe";
export { calculateAnnualPayment } from "./loan";
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
 * Wszystkie KPI sa z perspektywy wlasciciela — uwzgledniaja kredyt gdy wlaczony.
 * Tabela cash flow w roku 0 zawiera wklad wlasny (nie pelny CAPEX),
 * a w latach 1..n odejmuje raty kredytu od przeplywow.
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

  // 3. OPEX pierwszego roku
  const annualOpex = calculateOpex(totalCapex, 0);

  // 4. Kredyt
  const loanPrincipal = input.loanEnabled
    ? capexAfterSubsidy * (input.loanShare / 100)
    : 0;
  const loanAnnualPayment = input.loanEnabled
    ? calculateAnnualPayment(loanPrincipal, input.loanRate, input.loanTerm)
    : 0;

  // 5. Cash flow (perspektywa wlasciciela — z ratami kredytu)
  const cashFlowTable = buildCashFlowTable(
    input,
    capexAfterSubsidy,
    totalCapex,
    autoconsumptionRate,
    loanAnnualPayment,
    input.loanEnabled ? input.loanTerm : 0,
  );

  // 6. KPI — z tabeli CF wlasciciela
  const paybackYears = calculatePaybackPeriod(cashFlowTable);
  const npv = calculateNPV(cashFlowTable);
  const irr = calculateIRR(cashFlowTable);

  // 7. LCOE — uwzglednia koszty kredytu (raty wchodza w licznik)
  let lcoe: number;
  if (input.loanEnabled) {
    // LCOE wlasciciela: wklad wlasny + zdyskontowane (OPEX + raty) / zdyskontowana produkcja
    const ownContribution = capexAfterSubsidy * (1 - input.loanShare / 100);
    let discountedCosts = 0;
    let discountedEnergy = 0;
    for (const row of cashFlowTable) {
      if (row.year === 0) continue;
      const df = (1 + DISCOUNT_RATE) ** row.year;
      discountedCosts += (row.opex + row.loanPayment) / df;
      discountedEnergy += row.energyGenerated / df;
    }
    lcoe = discountedEnergy === 0
      ? Infinity
      : (ownContribution + discountedCosts) / discountedEnergy;
  } else {
    lcoe = calculateLCOE(
      capexAfterSubsidy,
      totalCapex,
      input.annualYield,
      input.degradacja,
    );
  }

  // 8. Produkcja miesieczna rok 1
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
    loanPrincipal,
    loanAnnualPayment,
    cashFlowTable,
    monthlyProductionYear1,
  };
}
