import type { AnnualCashFlowRow } from "#/engine";

interface Props {
	cashFlowTable: AnnualCashFlowRow[];
}

function fmt(v: number, decimals = 0) {
	return v.toLocaleString("pl-PL", { maximumFractionDigits: decimals });
}

export function CashFlowTable({ cashFlowTable }: Props) {
	const hasLoan = cashFlowTable.some((r) => r.loanPayment > 0);
	const hasInverter = cashFlowTable.some((r) => r.inverterReplacement > 0);

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Tabela cash flow
			</p>
			<div className="overflow-x-auto rounded-xl border border-(--chip-line)">
				<table className="w-full text-xs whitespace-nowrap">
					<thead>
						<tr className="bg-(--chip-bg)">
							<th className="sticky left-0 bg-(--chip-bg) px-3 py-2 text-left font-semibold uppercase tracking-wider text-(--sea-ink-soft) z-10">
								Rok
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Produkcja
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Autokon.
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Eksport
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Oszczędn.
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Sprzedaż
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								OPEX
							</th>
							{hasInverter && (
								<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
									Inwerter
								</th>
							)}
							{hasLoan && (
								<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
									Kredyt
								</th>
							)}
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Netto
							</th>
							<th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Skumul.
							</th>
						</tr>
					</thead>
					<tbody>
						{cashFlowTable.map((row) => (
							<tr
								key={row.year}
								className={`border-t border-(--chip-line) transition-colors hover:bg-(--foam) ${
									row.year === 0 ? "bg-(--chip-bg)/50" : ""
								}`}
							>
								<td className="sticky left-0 bg-(--chip-bg) px-3 py-1.5 font-semibold text-(--sea-ink) z-10">
									{row.year}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.energyGenerated)}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.energySelfConsumed)}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.energyExported)}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.savings)}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.exportRevenue)}
								</td>
								<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
									{fmt(row.opex)}
								</td>
								{hasInverter && (
									<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
										{row.inverterReplacement > 0 ? fmt(row.inverterReplacement) : "—"}
									</td>
								)}
								{hasLoan && (
									<td className="px-3 py-1.5 text-right tabular-nums text-(--sea-ink)">
										{row.loanPayment > 0 ? fmt(row.loanPayment) : "—"}
									</td>
								)}
								<td className={`px-3 py-1.5 text-right tabular-nums font-semibold ${
									row.netCashFlow >= 0 ? "text-green-600" : "text-red-500"
								}`}>
									{fmt(row.netCashFlow)}
								</td>
								<td className={`px-3 py-1.5 text-right tabular-nums font-semibold ${
									row.cumulativeCashFlow >= 0 ? "text-green-600" : "text-red-500"
								}`}>
									{fmt(row.cumulativeCashFlow)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
