import { PROJECT_LIFETIME } from "./constants";
import { calculateOpex } from "./opex";
import { getAnnualProduction } from "./production";
import type { AnnualCashFlowRow, SimulationInput } from "./types";

/**
 * Tryb obliczania okresu zwrotu:
 * - 'PROJECT': opieramy się na całkowitym CAPEX i przepływach operacyjnych (bez rat kredytu)
 * - 'EQUITY': opieramy się na wkładzie własnym i przepływach netto (z ratami kredytu)
 */
export type PaybackMode = 'PROJECT' | 'EQUITY';

/**
 * Generuje tabele przeplywow pienieznych rok po roku na caly okres zycia projektu.
 *
 * Struktura:
 * - Rok 0: wyplyw CAPEX (po dotacji), brak produkcji
 * - Rok 1..n: oszczednosci z autokonsumpcji + przychod z eksportu - OPEX - rata kredytu
 *
 * Uwzglednia:
 * - Degradacje paneli (malejaca produkcja r/r)
 * - Inflacje cen energii (rosnace ceny zakupu i sprzedazy r/r)
 * - Eskalacje OPEX
 * - Raty kredytu (jesli wlaczony, przez okres kredytu)
 * - Kumulatywny cash flow do okreslenia PBP
 *
 * @param input - Parametry symulacji (moc, ceny, degradacja, inflacja, uzyski PVGIS)
 * @param capexAfterSubsidy - CAPEX netto po dotacji (PLN)
 * @param initialCapex - CAPEX brutto przed dotacja (PLN) — baza dla OPEX
 * @param autoconsumptionRate - Wspolczynnik autokonsumpcji (0..1)
 * @param loanAnnualPayment - Roczna rata kredytu (PLN), 0 jesli brak
 * @param loanTerm - Okres kredytu w latach, 0 jesli brak
 * @param lifetime - Okres zycia projektu w latach (domyslnie 25)
 * @returns Tablica wierszy cash flow dla lat 0..lifetime
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

	// Rok 0 — inwestycja (jesli kredyt, wyplyw = tylko wklad wlasny)
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
			input.cenaEnergii * (1 + input.inflacjaEnergii) ** (year - 1);
		const exportPrice =
			input.cenaSprzedazy * (1 + input.inflacjaEnergii) ** (year - 1);

		const savings = energySelfConsumed * gridPrice;
		const exportRevenue = energyExported * exportPrice;
		const opex = calculateOpex(initialCapex, year - 1);

		// Rata kredytu — tylko w okresie splaty
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
 * Oblicza prosty czas zwrotu inwestycji (PBP / SPBT).
 *
 * Rozróżnia dwa tryby:
 * - PROJECT: Oblicza ile czasu zajmuje zwrócenie się całkowitej inwestycji (totalCapex)
 *   na bazie przepływów operacyjnych (savings + exportRevenue - opex), ignorując raty kredytu.
 *   Pokazuje efektywność surowego projektu.
 *
 * - EQUITY: Oblicza ile czasu zajmuje zwrócenie się wkładu własnego (ownContribution)
 *   na bazie przepływów netto (savings + exportRevenue - opex - loanPayment).
 *   Pokazuje, kiedy właściciel odzyska swoją rzeczywistą inwestycję.
 *
 * Stosuje interpolację liniową dla dokładności:
 * yearPrior + Math.abs(prevCumulative) / netCashFlowOfCurrentYear
 *
 * @param cashFlowTable - Tablica wierszy cash flow z roku 0 do PROJECT_LIFETIME
 * @param mode - Tryb obliczenia: 'PROJECT' lub 'EQUITY'
 * @param totalCapex - Całkowity CAPEX po dotacji (używany w trybie PROJECT)
 * @param ownContribution - Wkład własny właściciela (używany w trybie EQUITY)
 * @returns Czas zwrotu w latach (ułamkowy). Infinity jeśli nie osiągnięty w lifetime.
 */
export function calculatePaybackPeriod(
	cashFlowTable: AnnualCashFlowRow[],
	mode: PaybackMode,
	totalCapex: number,
	ownContribution: number,
): number {
	if (cashFlowTable.length === 0) return Infinity;

	const initialInvestment = mode === 'PROJECT' ? totalCapex : ownContribution;

	// Zabezpieczenie: jeśli inwestycja ≤ 0, zwrot natychmiastowy
	if (initialInvestment <= 0) return 0;

	let cumulative = -initialInvestment;

	// Jeśli już w roku 0 jesteśmy na + (niemożliwe, ale zabezpieczenie)
	if (cumulative >= 0) return 0;

	for (let i = 1; i < cashFlowTable.length; i++) {
		const row = cashFlowTable[i];

		// Wybierz przepływ w zależności od trybu
		let annualCashFlow: number;
		if (mode === 'PROJECT') {
			// Operating CF: savings + export - opex (bez rat kredytu)
			annualCashFlow = row.savings + row.exportRevenue - row.opex;
		} else {
			// Equity CF: savings + export - opex - loan (pełny netto cash flow)
			annualCashFlow = row.netCashFlow;
		}

		const prevCumulative = cumulative;
		cumulative += annualCashFlow;

		// Jeśli przekroczyliśmy zero
		if (cumulative >= 0) {
			// Jeśli już wcześniej byliśmy na +, to zwracamy poprzedni rok
			if (prevCumulative >= 0) return cashFlowTable[i - 1].year;

			// Linear interpolation: yearPrior + (abs(prevCum) / annualCashFlow)
			const denominator = cumulative - prevCumulative; // should equal annualCashFlow
			if (denominator === 0 || !Number.isFinite(denominator)) {
				return cashFlowTable[i - 1].year;
			}

			const fraction = Math.abs(prevCumulative) / denominator;
			if (!Number.isFinite(fraction) || fraction < 0) {
				return cashFlowTable[i - 1].year;
			}

			return cashFlowTable[i - 1].year + fraction;
		}
	}

	return Infinity;
}

/**
 * Oblicza zdyskontowany czas zwrotu inwestycji (discounted payback period).
 *
 * Działa analogicznie do calculatePaybackPeriod, ale zdyskontowuje przepływy
 * przed akumulacją (uwzględnia wartość czasu pieniądza).
 *
 * Stosuje tę samą logikę interpolacji co wersja prosta.
 *
 * @param cashFlowTable - Tablica wierszy cash flow z roku 0 do PROJECT_LIFETIME
 * @param discountRate - Stopa dyskontowa (np. 0.06 dla 6%)
 * @param mode - Tryb obliczenia: 'PROJECT' lub 'EQUITY'
 * @param totalCapex - Całkowity CAPEX po dotacji (używany w trybie PROJECT)
 * @param ownContribution - Wkład własny właściciela (używany w trybie EQUITY)
 * @returns Czas zwrotu w latach (ułamkowy). Infinity jeśli nie osiągnięty w lifetime.
 */
export function calculateDiscountedPaybackPeriod(
	cashFlowTable: AnnualCashFlowRow[],
	discountRate: number,
	mode: PaybackMode,
	totalCapex: number,
	ownContribution: number,
): number {
	if (cashFlowTable.length === 0) return Infinity;

	const initialInvestment = mode === 'PROJECT' ? totalCapex : ownContribution;

	// Zabezpieczenie: jeśli inwestycja ≤ 0, zwrot natychmiastowy
	if (initialInvestment <= 0) return 0;

	let cumulative = -initialInvestment;

	// Jeśli już w roku 0 jesteśmy na + (niemożliwe, ale zabezpieczenie)
	if (cumulative >= 0) return 0;

	for (let i = 1; i < cashFlowTable.length; i++) {
		const row = cashFlowTable[i];
		const discountFactor = (1 + discountRate) ** row.year;

		// Wybierz przepływ w zależności od trybu
		let annualCashFlow: number;
		if (mode === 'PROJECT') {
			// Operating CF: savings + export - opex (bez rat kredytu)
			annualCashFlow = row.savings + row.exportRevenue - row.opex;
		} else {
			// Equity CF: savings + export - opex - loan (pełny netto cash flow)
			annualCashFlow = row.netCashFlow;
		}

		// Zdyskontuj przepływ
		const discountedCashFlow = annualCashFlow / discountFactor;
		const prevCumulative = cumulative;
		cumulative += discountedCashFlow;

		// Jeśli przekroczyliśmy zero
		if (cumulative >= 0) {
			// Jeśli już wcześniej byliśmy na +, to zwracamy poprzedni rok
			if (prevCumulative >= 0) return cashFlowTable[i - 1].year;

			// Linear interpolation na zdyskontowanych przepływach
			const denominator = cumulative - prevCumulative; // should equal discountedCashFlow
			if (denominator === 0 || !Number.isFinite(denominator)) {
				return cashFlowTable[i - 1].year;
			}

			const fraction = Math.abs(prevCumulative) / denominator;
			if (!Number.isFinite(fraction) || fraction < 0) {
				return cashFlowTable[i - 1].year;
			}

			return cashFlowTable[i - 1].year + fraction;
		}
	}

	return Infinity;
}
