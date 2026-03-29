import { getAutoconsumptionRate } from "./autoconsumption";
import { applySubsidy, calculateCapex } from "./capex";
import {
	buildCashFlowTable,
	calculateDiscountedPaybackPeriod,
	calculatePaybackPeriod,
} from "./cashflow";
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

export { getAutoconsumptionRate } from "./autoconsumption";
export { applySubsidy, calculateCapex } from "./capex";
export {
	buildCashFlowTable,
	calculateDiscountedPaybackPeriod,
	calculatePaybackPeriod,
	type PaybackMode,
} from "./cashflow";
export {
	BASE_AUTOCONSUMPTION,
	CAPEX_TIERS,
	DISCOUNT_RATE,
	MAX_AUTOCONSUMPTION,
	OPEX_ESCALATION,
	OPEX_RATE,
	PROJECT_LIFETIME,
	STORAGE_COST_PER_KWH,
} from "./constants";
export { calculateIRR, calculateNPV } from "./kpi";
export { calculateLCOE } from "./lcoe";
export { calculateAnnualPayment } from "./loan";
export { calculateOpex } from "./opex";
// Re-eksport wszystkich funkcji i typow
export { getAnnualProduction, getMonthlyProduction } from "./production";
export type {
	AnnualCashFlowRow,
	CapexResult,
	MonthlyProduction,
	SimulationInput,
	SimulationResult,
} from "./types";

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

	// 3b. Kredyt
	const loanPrincipal = input.loanEnabled
		? capexAfterSubsidy * (input.loanShare / 100)
		: 0;
	const loanAnnualPayment = input.loanEnabled
		? calculateAnnualPayment(loanPrincipal, input.loanRate, input.loanTerm)
		: 0;

	// 4. Tabela cash flow
	const cashFlowTable = buildCashFlowTable(
		input,
		capexAfterSubsidy,
		totalCapex,
		autoconsumptionRate,
		loanAnnualPayment,
		input.loanEnabled ? input.loanTerm : 0,
	);

	// 5. KPI
	// Build a project-level cash flow table (exclude financing effects) so
	// that NPV/IRR/PBP reflect true project economics independent of loan structuring.
	const projectCashFlowTable = cashFlowTable.map((row) => ({
		...row,
		// Operating net cash flow excludes loan payments
		netCashFlow: row.savings + row.exportRevenue - row.opex,
		// financing item removed
		loanPayment: 0,
		cumulativeCashFlow: 0, // will compute next
	}));

	// Set year 0 as full CAPEX outflow
	projectCashFlowTable[0].netCashFlow = -capexAfterSubsidy;

	// Compute cumulative for project table
	for (let i = 0; i < projectCashFlowTable.length; i++) {
		if (i === 0) {
			projectCashFlowTable[i].cumulativeCashFlow =
				projectCashFlowTable[i].netCashFlow;
		} else {
			projectCashFlowTable[i].cumulativeCashFlow =
				projectCashFlowTable[i - 1].cumulativeCashFlow +
				projectCashFlowTable[i].netCashFlow;
		}
	}

	// Calculate payback/NPV/IRR from project-level perspective
	// PROJECT mode: uses totalCapex as initial investment, operating CF (no loans)
	const projectPayback = calculatePaybackPeriod(
		projectCashFlowTable,
		'PROJECT',
		capexAfterSubsidy,
		capexAfterSubsidy, // ownContribution not used in PROJECT mode
	);
	const projectPaybackDiscounted = calculateDiscountedPaybackPeriod(
		projectCashFlowTable,
		DISCOUNT_RATE,
		'PROJECT',
		capexAfterSubsidy,
		capexAfterSubsidy, // ownContribution not used in PROJECT mode
	);
	const projectLcoe = calculateLCOE(
		capexAfterSubsidy,
		totalCapex,
		input.annualYield,
		input.degradacja,
	);
	const projectNpv = calculateNPV(projectCashFlowTable);
	const projectIrr = calculateIRR(projectCashFlowTable);

	// Owner-perspective KPIs (uwzględniają finansowanie)
	const ownerNpv = calculateNPV(cashFlowTable);
	const ownerIrr = calculateIRR(cashFlowTable);
	// Owner pays only own contribution at year 0
	const ownContribution = input.loanEnabled
		? capexAfterSubsidy * (1 - input.loanShare / 100)
		: capexAfterSubsidy;

	// Owner payback: EQUITY mode uses ownContribution + net CF (including loans)
	const ownerPayback =
		ownContribution > 0
			? calculatePaybackPeriod(
					cashFlowTable,
					'EQUITY',
					capexAfterSubsidy,
					ownContribution,
				)
			: projectPayback; // Owner LCOE: include loan payments (discounted) in numerator
	// Numerator: CAPEX_netto + sum_t (OPEX_t + loanPayment_t) / (1+r)^t
	// Denominator: sum_t E_gen_t / (1+r)^t
	let discountedCosts = 0;
	let discountedEnergy = 0;
	for (const row of cashFlowTable) {
		if (row.year === 0) continue; // year 0 capex handled separately
		const df = (1 + DISCOUNT_RATE) ** row.year;
		discountedCosts += (row.opex + row.loanPayment) / df;
		discountedEnergy += row.energyGenerated / df;
	}
	const ownerLcoe =
		discountedEnergy === 0
			? Infinity
			: (ownContribution + discountedCosts) / discountedEnergy;

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
		// Main KPIs: project-perspective (niezależne od finansowania)
		lcoe: ownerLcoe,
		npv: projectNpv,
		irr: projectIrr,
		paybackYears: projectPayback,
		paybackYearsDiscounted: projectPaybackDiscounted,
		// Owner-perspective KPIs (optional reference)
		projectLcoe,
		loanPrincipal,
		loanAnnualPayment,
		cashFlowTable,
		monthlyProductionYear1,
		ownerNpv,
		ownerIrr,
		ownerPayback,
	};
}
