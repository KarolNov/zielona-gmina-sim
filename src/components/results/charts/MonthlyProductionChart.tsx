import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { MonthlyProduction } from "#/engine";
import { MIESIACE } from "#/lib/utils";

interface Props {
	monthly: MonthlyProduction[];
}

export function MonthlyProductionChart({ monthly }: Props) {
	const data = monthly.map((m) => ({
		month: MIESIACE[m.month],
		selfConsumed: Math.round(m.selfConsumed),
		exported: Math.round(m.exported),
	}));

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Produkcja miesięczna — rok 1
			</p>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
					<XAxis
						dataKey="month"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 11 }}
						tickFormatter={(v) => `${v.toLocaleString("pl-PL")}`}
					/>
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							const total = payload.reduce((s, p) => s + Number(p.value), 0);
							return (
								<div
									className="rounded-lg p-3 shadow-lg"
									style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-line)", color: "var(--sea-ink)" }}
								>
									<p className="font-bold text-xs mb-1" style={{ color: "var(--lagoon-deep)" }}>{label}</p>
									{payload.map((p) => (
										<p key={p.dataKey as string} className="text-xs">
											{p.name}: <span className="font-bold">{Number(p.value).toLocaleString("pl-PL")} kWh</span>
										</p>
									))}
									<p className="text-xs mt-1 border-t border-(--chip-line) pt-1">
										Razem: <span className="font-bold">{total.toLocaleString("pl-PL")} kWh</span>
									</p>
								</div>
							);
						}}
					/>
					<Legend wrapperStyle={{ fontSize: 11, color: "var(--sea-ink-soft)" }} />
					<Bar dataKey="selfConsumed" name="Autokonsumpcja" stackId="prod" fill="var(--lagoon-deep)" radius={[0, 0, 0, 0]} />
					<Bar dataKey="exported" name="Eksport" stackId="prod" fill="var(--lagoon)" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
