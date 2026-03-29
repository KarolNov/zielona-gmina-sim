import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { AnnualCashFlowRow } from "#/engine";

interface Props {
	cashFlowTable: AnnualCashFlowRow[];
}

export function CumulativeCashFlowChart({ cashFlowTable }: Props) {
	const data = cashFlowTable.map((row) => ({
		year: row.year,
		cumulative: Math.round(row.cumulativeCashFlow),
	}));

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Skumulowane przepływy pieniężne
			</p>
			<ResponsiveContainer width="100%" height={300}>
				<AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
					<XAxis
						dataKey="year"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
						label={{ value: "Rok", position: "insideBottomRight", offset: -5, fill: "var(--sea-ink-soft)", fontSize: 11 }}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 11 }}
						tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
					/>
					<ReferenceLine y={0} stroke="var(--sea-ink-soft)" strokeDasharray="4 4" />
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							return (
								<div
									className="rounded-lg p-3 shadow-lg"
									style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-line)", color: "var(--sea-ink)" }}
								>
									<p className="font-bold text-xs" style={{ color: "var(--lagoon-deep)" }}>Rok {label}</p>
									<p className="text-xs">
										Skumulowane:{" "}
										<span className="font-bold text-sm">
											{Number(payload[0].value).toLocaleString("pl-PL")} PLN
										</span>
									</p>
								</div>
							);
						}}
					/>
					<defs>
						<linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--lagoon-deep)" stopOpacity={0.3} />
							<stop offset="95%" stopColor="var(--lagoon-deep)" stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<Area
						type="monotone"
						dataKey="cumulative"
						stroke="var(--lagoon-deep)"
						strokeWidth={2}
						fill="url(#cumGrad)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
