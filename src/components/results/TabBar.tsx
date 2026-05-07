export type ResultTab = "kpi" | "charts" | "tables" | "sensitivity";

const TABS: { key: ResultTab; label: string }[] = [
	{ key: "kpi", label: "Wskaźniki" },
	{ key: "charts", label: "Wykresy" },
	{ key: "tables", label: "Tabele" },
	{ key: "sensitivity", label: "Wrażliwość" },
];

interface TabBarProps {
	activeTab: ResultTab;
	onTabChange: (tab: ResultTab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
	return (
		<div className="flex gap-2 mb-6">
			{TABS.map((tab) => (
				<button
					key={tab.key}
					type="button"
					onClick={() => onTabChange(tab.key)}
					className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition ${
						activeTab === tab.key
							? "bg-(--lagoon-deep) text-white"
							: "border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink-soft) hover:border-(--lagoon-deep) hover:text-(--sea-ink)"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
