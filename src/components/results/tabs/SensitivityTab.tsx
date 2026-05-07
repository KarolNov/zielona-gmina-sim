import { useMemo } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	runSensitivityAnalysis,
	runPriceScenarioSensitivity,
	type SimulationInput,
	type SensitivityPoint,
} from "#/engine";
import { formatPLN, formatPercent } from "#/lib/utils";

interface SensitivityTabProps {
	input: SimulationInput;
	modelRate: number;
}

const CHART_MARGIN = { top: 24, right: 30, left: 20, bottom: 5 };

function rateLabel(rate: number) {
	return `${(rate * 100).toFixed(0)}%`;
}

function CustomTooltip({
	active,
	payload,
	label,
	formatter,
	unit,
}: {
	active?: boolean;
	payload?: Array<{ value: number }>;
	label?: number;
	formatter: (v: number) => string;
	unit?: string;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div
			className="rounded-lg p-3 shadow-lg"
			style={{
				background: "var(--chip-bg)",
				border: "1px solid var(--chip-line)",
				color: "var(--sea-ink)",
			}}
		>
			<p
				className="font-bold text-xs"
				style={{ color: "var(--lagoon-deep)" }}
			>
				Autokonsumpcja: {rateLabel(label ?? 0)}
			</p>
			<p className="text-xs">
				<span className="font-bold text-sm">
					{formatter(payload[0].value)}
					{unit ? ` ${unit}` : ""}
				</span>
			</p>
		</div>
	);
}

function ModelMarker({ modelRate }: { modelRate: number }) {
	return (
		<ReferenceLine
			x={modelRate}
			stroke="var(--sea-ink)"
			strokeDasharray="6 3"
			strokeWidth={2}
			label={{
				value: `Model: ${rateLabel(modelRate)}`,
				position: "insideTop",
				fill: "var(--sea-ink)",
				fontSize: 11,
				fontWeight: 600,
				offset: -20,
			}}
		/>
	);
}

function SensitivityChart({
	title,
	data,
	dataKey,
	modelRate,
	formatter,
	unit,
	yTickFormatter,
	positiveThreshold,
}: {
	title: string;
	data: SensitivityPoint[];
	dataKey: keyof SensitivityPoint;
	modelRate: number;
	formatter: (v: number) => string;
	unit?: string;
	yTickFormatter?: (v: number) => string;
	positiveThreshold?: number;
}) {
	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">{title}</p>
			<ResponsiveContainer width="100%" height={280}>
				<LineChart data={data} margin={CHART_MARGIN}>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="var(--line)"
					/>
					<XAxis
						dataKey="rate"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
						tickFormatter={rateLabel}
						label={{
							value: "Autokonsumpcja",
							position: "insideBottomRight",
							offset: -5,
							fill: "var(--sea-ink-soft)",
							fontSize: 11,
						}}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 11 }}
						tickFormatter={yTickFormatter}
					/>
					{positiveThreshold !== undefined && (
						<ReferenceLine
							y={positiveThreshold}
							stroke="var(--sea-ink-soft)"
							strokeDasharray="4 4"
						/>
					)}
					<ModelMarker modelRate={modelRate} />
					<Tooltip
						content={({ active, payload, label }) => (
							<CustomTooltip
								active={active}
								payload={payload as unknown as Array<{ value: number }>}
								label={label as number}
								formatter={formatter}
								unit={unit}
							/>
						)}
					/>
					<Line
						type="monotone"
						dataKey={dataKey}
						stroke="var(--lagoon-deep)"
						strokeWidth={2.5}
						dot={false}
						activeDot={{ r: 5, fill: "var(--lagoon-deep)" }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

const SCENARIO_COLORS: Record<string, string> = {
	Pesymistyczny: "#c0392b",
	Bazowy: "var(--lagoon-deep)",
	Optymistyczny: "#2e7d32",
};

function PriceScenarioChart({
	scenarios,
	modelRate,
}: {
	scenarios: ReturnType<typeof runPriceScenarioSensitivity>;
	modelRate: number;
}) {
	// Merge scenarios into rows keyed by autoconsumption rate
	const merged = useMemo(() => {
		const ratesSet = new Set<number>();
		for (const s of scenarios) for (const p of s.points) ratesSet.add(p.rate);
		const rates = Array.from(ratesSet).sort((a, b) => a - b);
		return rates.map((rate) => {
			const row: Record<string, number> = { rate };
			for (const s of scenarios) {
				const pt = s.points.find((p) => p.rate === rate);
				if (pt) row[s.scenario] = pt.npv;
			}
			return row;
		});
	}, [scenarios]);

	return (
		<div>
			<p className="text-sm font-semibold text-(--sea-ink) mb-3">
				Wpływ wahań cen energii na NPV
			</p>
			<p className="text-xs text-(--sea-ink-soft) mb-3">
				Trzy scenariusze cenowe (pesymistyczny: −15% cen, inflacja ×0,5;
				bazowy: bieżące parametry; optymistyczny: +15% cen, inflacja ×1,5)
				w pełnym zakresie autokonsumpcji.
			</p>
			<ResponsiveContainer width="100%" height={360}>
				<LineChart
					data={merged}
					margin={{ top: 24, right: 30, left: 20, bottom: 32 }}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="var(--line)"
					/>
					<XAxis
						dataKey="rate"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
						tickFormatter={rateLabel}
						label={{
							value: "Autokonsumpcja",
							position: "insideBottomRight",
							offset: -5,
							fill: "var(--sea-ink-soft)",
							fontSize: 11,
						}}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 11 }}
						tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
					/>
					<ReferenceLine
						y={0}
						stroke="var(--sea-ink-soft)"
						strokeDasharray="4 4"
					/>
					<ModelMarker modelRate={modelRate} />
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;
							return (
								<div
									className="rounded-lg p-3 shadow-lg"
									style={{
										background: "var(--chip-bg)",
										border: "1px solid var(--chip-line)",
										color: "var(--sea-ink)",
									}}
								>
									<p
										className="font-bold text-xs mb-1"
										style={{ color: "var(--lagoon-deep)" }}
									>
										Autokonsumpcja: {rateLabel((label as number) ?? 0)}
									</p>
									{(
										payload as unknown as Array<{
											name: string;
											value: number;
											color: string;
										}>
									).map((p) => (
										<p
											key={p.name}
											className="text-xs"
											style={{ color: p.color }}
										>
											<span className="font-semibold">{p.name}:</span>{" "}
											{formatPLN(Math.round(p.value))}
										</p>
									))}
								</div>
							);
						}}
					/>
					<Legend
						verticalAlign="bottom"
						height={28}
						wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
					/>
					{scenarios.map((s) => (
						<Line
							key={s.scenario}
							type="monotone"
							dataKey={s.scenario}
							stroke={SCENARIO_COLORS[s.scenario] ?? "var(--lagoon-deep)"}
							strokeWidth={2.5}
							dot={false}
							activeDot={{ r: 5 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export function SensitivityTab({ input, modelRate }: SensitivityTabProps) {
	const { points } = useMemo(
		() => runSensitivityAnalysis(input, modelRate),
		[input, modelRate],
	);

	const priceScenarios = useMemo(
		() => runPriceScenarioSensitivity(input),
		[input],
	);

	// Filter out points where PBP is Infinity for cleaner chart
	const pbpData = points.filter((p) => p.paybackYears < 100);

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-(--chip-line) bg-(--chip-bg) p-4 space-y-2">
				<p className="text-sm text-(--sea-ink-soft)">
					Analiza pokazuje jak zmiana wskaźnika autokonsumpcji wpływa na
					opłacalność inwestycji. Linia przerywana oznacza wartość przyjętą
					przez model ({rateLabel(modelRate)}) na podstawie rozmiaru gminy i
					magazynu energii.
				</p>
				<p className="text-xs text-(--sea-ink-soft)">
					Diminishing returns wynika bezpośrednio z modelu cash flow:
					oszczędności i opust wyceniane są po cenie bazowej, a rezydualny
					import obciążony narzutem prosumenckim ({" "}
					<code>importPrice − gridPrice</code>). CAPEX i magazyn energii
					pozostają takie jak w parametrach symulacji — krzywa pokazuje,
					jak sam wskaźnik AC wpływa na opłacalność, niezależnie od
					sposobu jego osiągnięcia.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
				<SensitivityChart
					title="NPV (wartość bieżąca netto) vs. autokonsumpcja"
					data={points}
					dataKey="npv"
					modelRate={modelRate}
					formatter={(v) => formatPLN(Math.round(v))}
					yTickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
					positiveThreshold={0}
				/>

				<SensitivityChart
					title="IRR (wewnętrzna stopa zwrotu) vs. autokonsumpcja"
					data={points.filter((p) => !Number.isNaN(p.irr))}
					dataKey="irr"
					modelRate={modelRate}
					formatter={(v) => formatPercent(v)}
					yTickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
					positiveThreshold={0.06}
				/>

				<SensitivityChart
					title="Okres zwrotu (PBP) vs. autokonsumpcja"
					data={pbpData}
					dataKey="paybackYears"
					modelRate={modelRate}
					formatter={(v) =>
						v === Infinity ? "> 25 lat" : `${v.toFixed(1)} lat`
					}
					unit=""
					yTickFormatter={(v) => `${v.toFixed(0)} lat`}
				/>

				<SensitivityChart
					title="LCOE (koszt energii) vs. autokonsumpcja"
					data={points}
					dataKey="lcoe"
					modelRate={modelRate}
					formatter={(v) => `${v.toFixed(2)} PLN/kWh`}
					yTickFormatter={(v) => `${v.toFixed(2)}`}
					positiveThreshold={input.cenaEnergii}
				/>
			</div>

			<PriceScenarioChart
				scenarios={priceScenarios}
				modelRate={modelRate}
			/>

			{/* Summary table */}
			<div>
				<p className="text-sm font-semibold text-(--sea-ink) mb-3">
					Tabela wrażliwości
				</p>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-(--chip-line) text-left text-xs text-(--sea-ink-soft) uppercase tracking-wider">
								<th className="pb-2 pr-4">Autokonsumpcja</th>
								<th className="pb-2 pr-4">NPV</th>
								<th className="pb-2 pr-4">IRR</th>
								<th className="pb-2 pr-4">PBP</th>
								<th className="pb-2 pr-4">LCOE</th>
								<th className="pb-2 pr-4">Oszczędności 25 lat</th>
								<th className="pb-2">Przychód z eksportu</th>
							</tr>
						</thead>
						<tbody>
							{points.map((p) => {
								const isModel =
									Math.abs(p.rate - modelRate) < 0.01;
								return (
									<tr
										key={p.rate}
										className={`border-b border-(--chip-line)/50 ${isModel ? "bg-(--foam) font-semibold" : ""}`}
									>
										<td className="py-1.5 pr-4">
											{rateLabel(p.rate)}
											{isModel && (
												<span className="ml-1 text-xs text-(--lagoon-deep)">
													(model)
												</span>
											)}
										</td>
										<td className="py-1.5 pr-4">
											{formatPLN(Math.round(p.npv))}
										</td>
										<td className="py-1.5 pr-4">
											{Number.isNaN(p.irr)
												? "—"
												: formatPercent(p.irr)}
										</td>
										<td className="py-1.5 pr-4">
											{p.paybackYears === Infinity
												? "> 25 lat"
												: `${p.paybackYears.toFixed(1)} lat`}
										</td>
										<td className="py-1.5 pr-4">
											{p.lcoe.toFixed(2)} PLN/kWh
										</td>
										<td className="py-1.5 pr-4">
											{formatPLN(Math.round(p.totalSavings))}
										</td>
										<td className="py-1.5">
											{formatPLN(
												Math.round(p.totalExportRevenue),
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
