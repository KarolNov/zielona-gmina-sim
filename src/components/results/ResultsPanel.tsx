import { useState } from "react";
import type { SimulationInput, SimulationResult } from "#/engine";
import { TabBar, type ResultTab } from "./TabBar";
import { KpiTab } from "./tabs/KpiTab";
import { ChartsTab } from "./tabs/ChartsTab";
import { TablesTab } from "./tabs/TablesTab";
import { SensitivityTab } from "./tabs/SensitivityTab";

interface ResultsPanelProps {
	result: SimulationResult;
	cenaEnergii: number;
	simulationInput: SimulationInput;
}

export function ResultsPanel({ result, cenaEnergii, simulationInput }: ResultsPanelProps) {
	const [tab, setTab] = useState<ResultTab>("kpi");

	return (
		<section className="island-shell mt-8 rounded-2xl p-6">
			<p className="island-kicker mb-4">Wyniki symulacji</p>
			<TabBar activeTab={tab} onTabChange={setTab} />
			{tab === "kpi" && <KpiTab result={result} cenaEnergii={cenaEnergii} />}
			{tab === "charts" && <ChartsTab result={result} />}
			{tab === "tables" && <TablesTab result={result} />}
			{tab === "sensitivity" && (
				<SensitivityTab
					input={simulationInput}
					modelRate={result.autoconsumptionRate}
				/>
			)}
		</section>
	);
}
