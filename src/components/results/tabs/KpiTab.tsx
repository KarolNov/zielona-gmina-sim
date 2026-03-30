import type { SimulationResult } from "#/engine";
import { formatPercent, formatPLN, formatYears } from "#/lib/utils";

interface KpiTabProps {
	result: SimulationResult;
	cenaEnergii: number;
}

function kpiColor(good: boolean, neutral?: boolean) {
	if (good) return "text-green-600";
	if (neutral) return "text-amber-500";
	return "text-red-500";
}

export function KpiTab({ result, cenaEnergii }: KpiTabProps) {
	const irr = result.irr;
	const pbp = result.paybackYears;
	const hasLoan = result.loanPrincipal > 0;
	// Przy 100% kredytu wklad wlasny = 0, IRR i PBP nie maja sensu
	const noOwnCapital =
		hasLoan && result.cashFlowTable[0].netCashFlow >= -1;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{/* IRR */}
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
				<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
					Wewnętrzna stopa zwrotu (IRR)
				</p>
				{noOwnCapital ? (
					<>
						<p className="text-2xl font-bold text-(--sea-ink-soft)">—</p>
						<p className="text-xs text-(--sea-ink-soft) mt-1">
							Brak wkładu własnego — IRR nie dotyczy
						</p>
					</>
				) : (
					<>
						<p
							className={`text-2xl font-bold ${kpiColor(irr > 0.06, irr >= 0.03)}`}
						>
							{Number.isNaN(irr) ? "—" : formatPercent(irr)}
						</p>
						<p className="text-xs text-(--sea-ink-soft) mt-1">
							Wymagana: &gt;6% (stopa dyskontowa)
						</p>
					</>
				)}
			</div>

			{/* Payback */}
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
				<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
					Okres zwrotu (PBP)
				</p>
				{noOwnCapital ? (
					<>
						<p className="text-2xl font-bold text-(--sea-ink-soft)">—</p>
						<p className="text-xs text-(--sea-ink-soft) mt-1">
							Brak wkładu własnego — natychmiastowy zwrot
						</p>
					</>
				) : (
					<>
						<p className={`text-2xl font-bold ${kpiColor(pbp < 10, pbp <= 15)}`}>
							{pbp === Number.POSITIVE_INFINITY
								? "> 25 lat"
								: formatYears(pbp)}
						</p>
						<p className="text-xs text-(--sea-ink-soft) mt-1">
							{hasLoan ? "Z uwzględnieniem rat kredytu" : "Żywotność projektu: 25 lat"}
						</p>
					</>
				)}
			</div>

			{/* NPV */}
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
				<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
					Wartość bieżąca netto (NPV)
				</p>
				<p className={`text-2xl font-bold ${kpiColor(result.npv > 0)}`}>
					{formatPLN(Math.round(result.npv))}
				</p>
				<p className="text-xs text-(--sea-ink-soft) mt-1">
					{result.npv > 0
						? "Projekt opłacalny"
						: "Projekt nieopłacalny przy danej stopie dyskontowej"}
				</p>
			</div>

			{/* LCOE */}
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
				<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
					Koszt energii (LCOE)
				</p>
				<p
					className={`text-2xl font-bold ${kpiColor(result.lcoe < cenaEnergii)}`}
				>
					{result.lcoe.toFixed(2)} PLN/kWh
				</p>
				<p className="text-xs text-(--sea-ink-soft) mt-1">
					vs. {cenaEnergii.toFixed(2)} PLN/kWh z sieci
				</p>
			</div>

			{/* CAPEX netto */}
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
				<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
					CAPEX netto
				</p>
				<p className="text-2xl font-bold text-(--sea-ink)">
					{formatPLN(Math.round(result.capexAfterSubsidy))}
				</p>
				<p className="text-xs text-(--sea-ink-soft) mt-1">
					Przed dotacją: {formatPLN(Math.round(result.capex))}
				</p>
			</div>

			{/* Kredyt lub Autokonsumpcja */}
			{hasLoan ? (
				<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
					<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
						Kredyt
					</p>
					<p className="text-2xl font-bold text-(--sea-ink)">
						{formatPLN(Math.round(result.loanAnnualPayment))}/rok
					</p>
					<p className="text-xs text-(--sea-ink-soft) mt-1">
						Kwota: {formatPLN(Math.round(result.loanPrincipal))}
					</p>
				</div>
			) : (
				<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4">
					<p className="text-xs text-(--sea-ink-soft) uppercase tracking-wider mb-1">
						Autokonsumpcja
					</p>
					<p className="text-2xl font-bold text-(--sea-ink)">
						{formatPercent(result.autoconsumptionRate, 0)}
					</p>
					<p className="text-xs text-(--sea-ink-soft) mt-1">
						OPEX roczny (rok 1): {formatPLN(Math.round(result.annualOpex))}
					</p>
				</div>
			)}
		</div>
	);
}
