import type { SimulationResult } from "#/engine";
import { formatPLN } from "#/lib/utils";

interface Props {
	result: SimulationResult;
}

export function CapexBreakdownTable({ result }: Props) {
	const pvCost = result.capex - result.storageCost;
	const subsidy = result.capex - result.capexAfterSubsidy;

	const rows = [
		{ label: "Instalacja PV", value: pvCost },
		...(result.storageCost > 0
			? [{ label: "Magazyn energii", value: result.storageCost }]
			: []),
		{ label: "CAPEX brutto", value: result.capex, bold: true },
		{ label: "Dofinansowanie", value: -subsidy },
		{ label: "CAPEX netto (wkład własny)", value: result.capexAfterSubsidy, bold: true },
		...(result.loanPrincipal > 0
			? [
				{ label: "Kwota kredytu", value: result.loanPrincipal },
				{ label: "Rata roczna kredytu", value: result.loanAnnualPayment },
			  ]
			: []),
		{ label: "OPEX roczny (rok 1)", value: result.annualOpex },
	];

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Podsumowanie kosztów
			</p>
			<div className="overflow-hidden rounded-xl border border-(--chip-line)">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-(--chip-bg)">
							<th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Pozycja
							</th>
							<th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
								Kwota
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={row.label}
								className="border-t border-(--chip-line) hover:bg-(--foam) transition-colors"
							>
								<td className={`px-4 py-2 text-(--sea-ink) ${row.bold ? "font-bold" : ""}`}>
									{row.label}
								</td>
								<td
									className={`px-4 py-2 text-right tabular-nums ${
										row.value < 0 ? "text-red-500" : "text-(--sea-ink)"
									} ${row.bold ? "font-bold" : ""}`}
								>
									{formatPLN(Math.round(row.value))}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
