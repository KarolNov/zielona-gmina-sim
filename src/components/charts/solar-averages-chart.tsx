import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { prepareMonthlyChartData } from "#/lib/utils";

interface SolarSeasonalChartProps {
	apiResponse: {
		monthlyYields: number[];
		annualYield: number;
		locationInfo: string;
	};
	isRefetching?: boolean;
}

export const SolarSeasonalChart = ({
	apiResponse,
	isRefetching,
}: SolarSeasonalChartProps) => {
	// Przekształcamy dane:
	// 1. Używamy helpera, żeby mieć nazwy miesięcy
	// 2. Mnóżymy każdą wartość przez 'capacityKwp', żeby pokazać REALNĄ produkcję
	const chartData = prepareMonthlyChartData(apiResponse.monthlyYields).map(
		(item) => ({
			...item,
			produkcja: Math.round(item.produkcja),
		}),
	);

	return (
		<div className="relative">
			<ResponsiveContainer width="100%" height={300}>
				<BarChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					barGap={0}
				>
					{/* Siatka: używamy Tailwindowej klasy dla koloru */}
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="var(--line)"
					/>

					<XAxis
						dataKey="nazwaMiesiaca"
						tickLine={false}
						axisLine={false}
						tick={{ fill: "var(--sea-ink-soft)", fontSize: 12 }}
					/>

					{/* Oś Y: Ukrywamy, bo dodamy etykiety bezpośrednio nad słupkami */}
					<YAxis hide={true} />

					{/* Tooltip: Stylizowany w Tailwindzie */}
					<Tooltip
						cursor={{ fill: "var(--hero-a)" }} // Delikatny hover background that follows theme
						content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div
										style={{
											background: "var(--chip-bg)",
											border: "1px solid var(--chip-line)",
											color: "var(--sea-ink)",
										}}
										className="p-3 rounded-lg shadow-lg"
									>
										<p className="font-bold" style={{ color: "var(--lagoon-deep)" }}>
											{label}
										</p>
										<p className="text-xs">
											Produkcja:
											<span className="font-bold text-sm" style={{ color: "var(--sea-ink)" }}>
												{" "}
												{payload[0].value?.toLocaleString("pl-PL")} kWh
											</span>
										</p>
									</div>
								);
							}
							return null;
						}}
					/>

					{/* Słupek: Kolor green-500 z Tailwinda, zaokrąglone rogi */}
					<Bar dataKey="produkcja" fill="var(--lagoon-deep)" radius={[10, 10, 0, 0]}>
						{/* Etykiety nad słupkami */}
						<LabelList
							dataKey="produkcja"
							position="top"
							fill="var(--sea-ink)"
							style={{ fontWeight: 600, fontSize: 10 }}
							formatter={(value) =>
								Number(value) > 50
									? `${Number(value).toLocaleString("pl-PL")}`
									: ""
							}
						/>
					</Bar>
				</BarChart>
			</ResponsiveContainer>

			<div className={`absolute inset-0 backdrop-blur-xs flex items-center justify-center transition-opacity${isRefetching ? "" : " pointer-events-none opacity-0 duration-500"}`}>
				<span className="text-lg text-slate-500 italic">
					Aktualizacja danych...
				</span>
			</div>
		</div>
	);
};
