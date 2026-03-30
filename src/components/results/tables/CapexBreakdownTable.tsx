import type { SimulationResult } from "#/engine";
import { formatPLN } from "#/lib/utils";

interface Props {
	result: SimulationResult;
}

export function CapexBreakdownTable({ result }: Props) {
	const pvCost = result.capex - result.storageCost;
	const subsidy = result.capex - result.capexAfterSubsidy;

	const capexRows = [
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
	];

	const b = result.annualOpexBreakdown;
	const opexRows = [
		{ label: "Serwisowanie / czyszczenie", value: b.servicing },
		{ label: "Ubezpieczenie", value: b.insurance },
		{ label: "Naprawy", value: b.repairs },
		{ label: "Monitoring", value: b.monitoring },
		{ label: "OPEX roczny (rok 1)", value: b.total, bold: true },
		{ label: `Wymiana inwertera (rok ${result.inverterReplacementYear})`, value: result.inverterReplacementCost },
	];

	return (
		<div className="space-y-4">
			<Section title="Podsumowanie kosztów inwestycji" rows={capexRows} />
			<Section title="Koszty utrzymania" rows={opexRows} />
		</div>
	);
}

function Section({ title, rows }: { title: string; rows: { label: string; value: number; bold?: boolean }[] }) {
	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				{title}
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
