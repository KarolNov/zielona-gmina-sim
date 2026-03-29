import { useState } from "react";
import type { SimulationResult } from "#/engine";
import { TabBar, type ResultTab } from "./TabBar";
import { KpiTab } from "./tabs/KpiTab";
import { ChartsTab } from "./tabs/ChartsTab";
import { TablesTab } from "./tabs/TablesTab";

interface ResultsPanelProps {
	result: SimulationResult;
	cenaEnergii: number;
}

export function ResultsPanel({ result, cenaEnergii }: ResultsPanelProps) {
	const [tab, setTab] = useState<ResultTab>("kpi");

	return (
		<section className="island-shell mt-8 rounded-2xl p-6">
			<p className="island-kicker mb-4">Wyniki symulacji</p>
			<TabBar activeTab={tab} onTabChange={setTab} />
			{tab === "kpi" && <KpiTab result={result} cenaEnergii={cenaEnergii} />}
			{tab === "charts" && <ChartsTab result={result} />}
			{tab === "tables" && <TablesTab result={result} />}
		</section>
	);
}
