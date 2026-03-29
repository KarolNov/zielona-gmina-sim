import type { SimulationResult } from "#/engine";
import { CapexBreakdownTable } from "../tables/CapexBreakdownTable";
import { CashFlowTable } from "../tables/CashFlowTable";

interface TablesTabProps {
	result: SimulationResult;
}

export function TablesTab({ result }: TablesTabProps) {
	return (
		<div className="space-y-8">
			<CapexBreakdownTable result={result} />
			<CashFlowTable cashFlowTable={result.cashFlowTable} />
		</div>
	);
}
