import { applySubsidy, calculateCapex } from "./capex";
import { buildCashFlowTable, calculatePaybackPeriod } from "./cashflow";
import {
  AC_NO_STORAGE_BASELINE,
  AC_STORAGE_ASYMPTOTE,
  DISCOUNT_RATE,
  MAX_AUTOCONSUMPTION,
  STORAGE_REQUIREMENT_SCALE_KWH_PER_KWP,
} from "./constants";
import { calculateIRR, calculateNPV } from "./kpi";
import { calculateLCOE } from "./lcoe";
import { calculateAnnualPayment } from "./loan";
import type { SimulationInput } from "./types";

/**
 * Storage capacity (kWh) needed to reach a target AC level.
 *
 * Saturating logarithmic model:
 *   storage_per_kwp = SCALE × (−ln(1 − (target − baseline)/(asymptote − baseline)))
 *
 * - Below AC_NO_STORAGE_BASELINE: no storage (load scheduling alone)
 * - Above baseline: each pp of AC costs progressively more storage
 * - Approaches infinity near AC_STORAGE_ASYMPTOTE — natural saturation
 *
 * No hard knee: marginal storage per pp grows smoothly with target AC,
 * which produces a soft flattening on the PBP/NPV curve at high AC.
 */
function storageNeededForRate(targetRate: number, pvPower: number): number {
  if (targetRate <= AC_NO_STORAGE_BASELINE) return 0;
  const cappedTarget = Math.min(targetRate, MAX_AUTOCONSUMPTION);
  const fraction = Math.min(
    (cappedTarget - AC_NO_STORAGE_BASELINE) /
      (AC_STORAGE_ASYMPTOTE - AC_NO_STORAGE_BASELINE),
    0.99,
  );
  return -Math.log(1 - fraction) * STORAGE_REQUIREMENT_SCALE_KWH_PER_KWP * pvPower;
}

/** Single data point in the sensitivity sweep */
export interface SensitivityPoint {
  /** Autoconsumption rate (0–1) */
  rate: number;
  /** Net Present Value (PLN) */
  npv: number;
  /** Internal Rate of Return (decimal, e.g. 0.12 = 12%) */
  irr: number;
  /** Payback period (years), Infinity if not reached */
  paybackYears: number;
  /** Levelized Cost of Energy (PLN/kWh) */
  lcoe: number;
  /** Total 25-year savings from self-consumed energy (PLN) */
  totalSavings: number;
  /** Total 25-year export revenue (PLN) */
  totalExportRevenue: number;
}

export interface SensitivityResult {
  /** Swept data points */
  points: SensitivityPoint[];
  /** The autoconsumption rate computed by the model for current inputs */
  modelRate: number;
}

/** Extra fields when sweep models the cost of achieving each AC level */
export interface SensitivityPointWithStorage extends SensitivityPoint {
  /** Storage capacity (kWh) required to reach this AC rate */
  requiredStorage: number;
  /** Total CAPEX (PLN, before subsidy) including storage for this AC level */
  totalCapex: number;
}

/**
 * Runs a sensitivity sweep: re-computes all KPIs for a range of
 * autoconsumption rates while modelling the cost of reaching each level.
 *
 * Up to STORAGE_FREE_AC_THRESHOLD (~70%) AC is treated as achievable
 * through load scheduling — no extra CAPEX. Above that threshold the
 * sweep auto-sizes a battery, adds its CAPEX/OPEX/loan implications to
 * the cash flow, and the curve enters the diminishing-returns regime
 * where extra self-consumption revenue is offset by storage cost.
 */
export function runSensitivityAnalysis(
  input: SimulationInput,
  modelRate: number,
  steps: number[] = defaultSteps(),
): SensitivityResult {
  const points: SensitivityPointWithStorage[] = steps.map((rate) => {
    const requiredStorage = storageNeededForRate(rate, input.pvPower);
    const { totalCapex } = calculateCapex(input.pvPower, requiredStorage);
    const capexAfterSubsidy = applySubsidy(totalCapex, input.donation);

    const loanPrincipal = input.loanEnabled
      ? capexAfterSubsidy * (input.loanShare / 100)
      : 0;
    const loanAnnualPayment = input.loanEnabled
      ? calculateAnnualPayment(loanPrincipal, input.loanRate, input.loanTerm)
      : 0;
    const loanTerm = input.loanEnabled ? input.loanTerm : 0;

    const cashFlowTable = buildCashFlowTable(
      input,
      capexAfterSubsidy,
      totalCapex,
      Math.min(rate, MAX_AUTOCONSUMPTION),
      loanAnnualPayment,
      loanTerm,
    );

    const paybackYears = calculatePaybackPeriod(cashFlowTable);
    const npv = calculateNPV(cashFlowTable);
    const irr = calculateIRR(cashFlowTable);

    // LCOE with loan perspective
    let lcoe: number;
    if (input.loanEnabled) {
      const ownContribution = capexAfterSubsidy * (1 - input.loanShare / 100);
      let discountedCosts = 0;
      let discountedEnergy = 0;
      for (const row of cashFlowTable) {
        if (row.year === 0) continue;
        const df = (1 + DISCOUNT_RATE) ** row.year;
        discountedCosts +=
          (row.opex + row.inverterReplacement + row.loanPayment) / df;
        discountedEnergy += row.energyGenerated / df;
      }
      lcoe =
        discountedEnergy === 0
          ? Infinity
          : (ownContribution + discountedCosts) / discountedEnergy;
    } else {
      lcoe = calculateLCOE(
        capexAfterSubsidy,
        totalCapex,
        input.pvPower,
        input.annualYield,
        input.degradacja,
      );
    }

    // Aggregate savings and export revenue over project lifetime
    let totalSavings = 0;
    let totalExportRevenue = 0;
    for (const row of cashFlowTable) {
      totalSavings += row.savings;
      totalExportRevenue += row.exportRevenue;
    }

    return {
      rate,
      npv,
      irr,
      paybackYears,
      lcoe,
      totalSavings,
      totalExportRevenue,
      requiredStorage,
      totalCapex,
    };
  });

  return { points, modelRate };
}

function defaultSteps(): number[] {
  const steps: number[] = [];
  for (let pct = 10; pct <= 90; pct += 5) {
    steps.push(pct / 100);
  }
  return steps;
}

/** Scenariusz cenowy dla analizy wrazliwosci NPV na wahania cen energii */
export interface PriceScenario {
  /** Etykieta scenariusza (Pesymistyczny / Bazowy / Optymistyczny) */
  label: string;
  /** Mnoznik dla ceny zakupu i importu energii */
  priceMultiplier: number;
  /** Mnoznik dla rocznej inflacji ceny energii */
  inflationMultiplier: number;
}

/**
 * Domyslne scenariusze cenowe dla analizy NPV.
 *
 * - Pesymistyczny: ceny energii spadaja o 15%, inflacja o polowe
 *   (np. wzrost konkurencji, regulacje, taryfy gwarantowane)
 * - Bazowy: aktualnie wprowadzone parametry
 * - Optymistyczny: ceny rosna o 15%, inflacja przyspiesza o 50%
 *   (np. kryzys energetyczny, dekarbonizacja, wzrost cen CO2)
 */
export const DEFAULT_PRICE_SCENARIOS: PriceScenario[] = [
  { label: "Pesymistyczny", priceMultiplier: 0.85, inflationMultiplier: 0.5 },
  { label: "Bazowy", priceMultiplier: 1.0, inflationMultiplier: 1.0 },
  { label: "Optymistyczny", priceMultiplier: 1.15, inflationMultiplier: 1.5 },
];

/** Wynik analizy wrazliwosci dla pojedynczego scenariusza cenowego */
export interface PriceScenarioResult {
  /** Etykieta scenariusza */
  scenario: string;
  /** Zastosowany mnoznik cenowy */
  priceMultiplier: number;
  /** Zastosowany mnoznik inflacji */
  inflationMultiplier: number;
  /** Punkty wrazliwosci dla tego scenariusza */
  points: SensitivityPoint[];
}

/**
 * Dla kazdego scenariusza cenowego oblicza wrazliwosc NPV/IRR/PBP
 * na zmiany autokonsumpcji.
 *
 * Pozwala pokazac, jak wahania cen energii (pesymistyczne/bazowe/optymistyczne)
 * wplywaja na oplacalnosc inwestycji w pelnym zakresie autokonsumpcji.
 */
export function runPriceScenarioSensitivity(
  input: SimulationInput,
  scenarios: PriceScenario[] = DEFAULT_PRICE_SCENARIOS,
  steps: number[] = defaultSteps(),
): PriceScenarioResult[] {
  return scenarios.map((s) => {
    const scenarioInput: SimulationInput = {
      ...input,
      cenaEnergii: input.cenaEnergii * s.priceMultiplier,
      cenaEnergiiImport: input.cenaEnergiiImport * s.priceMultiplier,
      inflacjaEnergii: input.inflacjaEnergii * s.inflationMultiplier,
    };
    const { points } = runSensitivityAnalysis(scenarioInput, 0, steps);
    return {
      scenario: s.label,
      priceMultiplier: s.priceMultiplier,
      inflationMultiplier: s.inflationMultiplier,
      points,
    };
  });
}
