import {
	Bar,
	CartesianGrid,
	Legend,
	ComposedChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { AnnualCashFlowRow } from "#/engine";

interface Props {
	cashFlowTable: AnnualCashFlowRow[];
}

export function AnnualCashFlowChart({ cashFlowTable }: Props) {
	const hasLoan = cashFlowTable.some((r) => r.loanPayment > 0);

	// Stack: netCashFlow (bottom) + opex + loanPayment (top) = gross income
	const data = cashFlowTable.filter((r) => r.year > 0).map((row) => ({
		year: row.year,
		netCashFlow: Math.round(row.netCashFlow),
		opex: Math.round(row.opex),
		loanPayment: Math.round(row.loanPayment),
		// keep raw values for tooltip
		savings: Math.round(row.savings),
		exportRevenue: Math.round(row.exportRevenue),
	}));

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Roczne przepływy pieniężne
			</p>
			<ResponsiveContainer width="100%" height={320}>
				<ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
					<XAxis
						dataKey="year"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 11 }}
						tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
					/>
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							const row = data.find((d) => d.year === label);
							if (!row) return null;
							const gross = row.savings + row.exportRevenue;
							return (
								<div
									className="rounded-lg p-3 shadow-lg"
									style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-line)", color: "var(--sea-ink)" }}
								>
									<p className="font-bold text-xs mb-1" style={{ color: "var(--lagoon-deep)" }}>Rok {label}</p>
									<p className="text-xs">Oszczędności: <span className="font-bold">{row.savings.toLocaleString("pl-PL")} PLN</span></p>
									<p className="text-xs">Sprzedaż: <span className="font-bold">{row.exportRevenue.toLocaleString("pl-PL")} PLN</span></p>
									<p className="text-xs text-(--sea-ink-soft)">Brutto: <span className="font-bold">{gross.toLocaleString("pl-PL")} PLN</span></p>
									<p className="text-xs text-(--sea-ink-soft)">OPEX: <span className="font-bold">-{row.opex.toLocaleString("pl-PL")} PLN</span></p>
									{row.loanPayment > 0 && (
										<p className="text-xs text-(--sea-ink-soft)">Kredyt: <span className="font-bold">-{row.loanPayment.toLocaleString("pl-PL")} PLN</span></p>
									)}
									<p className="text-xs border-t border-(--chip-line) mt-1 pt-1 font-bold">Netto: {row.netCashFlow.toLocaleString("pl-PL")} PLN</p>
								</div>
							);
						}}
					/>
					<Legend
						wrapperStyle={{ fontSize: 11, color: "var(--sea-ink-soft)" }}
					/>
					<Bar dataKey="netCashFlow" name="Netto" stackId="a" fill="var(--lagoon-deep)" radius={[0, 0, 0, 0]} />
					<Bar dataKey="opex" name="OPEX" stackId="a" fill="var(--sea-ink-soft)" opacity={0.4} radius={hasLoan ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
					{hasLoan && (
						<Bar dataKey="loanPayment" name="Kredyt" stackId="a" fill="var(--kicker)" opacity={0.5} radius={[4, 4, 0, 0]} />
					)}
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}
