import type { SimulationResult } from "#/engine";
import { CumulativeCashFlowChart } from "../charts/CumulativeCashFlowChart";
import { AnnualCashFlowChart } from "../charts/AnnualCashFlowChart";
import { MonthlyProductionChart } from "../charts/MonthlyProductionChart";

interface ChartsTabProps {
	result: SimulationResult;
}

export function ChartsTab({ result }: ChartsTabProps) {
	return (
		<div className="space-y-8">
			<CumulativeCashFlowChart cashFlowTable={result.cashFlowTable} />
			<AnnualCashFlowChart cashFlowTable={result.cashFlowTable} />
			<MonthlyProductionChart monthly={result.monthlyProductionYear1} />
		</div>
	);
}
