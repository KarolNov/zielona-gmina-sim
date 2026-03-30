export const MIESIACE = [
  "Sty", "Lut", "Mar", "Kwi", "Maj", "Cze",
  "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"
];

// Funkcja, która paruje nazwy miesięcy z danymi z API
export const prepareMonthlyChartData = (apiYields: number[]) => {
  return apiYields.map((value, index) => ({
    nazwaMiesiaca: MIESIACE[index],
    produkcja: Math.round(value), // Zaokrąglamy dla czystości na wykresie
  }));
};

export function formatPLN(value: number): string {
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) + " PLN";
}

export function formatPercent(value: number, decimals = 1): string {
  return (value * 100).toFixed(decimals) + "%";
}

export function formatKWh(value: number): string {
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) + " kWh";
}

export function formatYears(years: number): string {
	const fullYears = Math.floor(years);
	const remainingMonths = Math.ceil((years - fullYears) * 12);

	const normalizedYears = remainingMonths === 12 ? fullYears + 1 : fullYears;
	const normalizedMonths = remainingMonths === 12 ? 0 : remainingMonths;

	const yearWord = (y: number) => {
		if (y === 1) return "rok";
		if (y >= 2 && y <= 4) return "lata";
		return "lat";
	};
	const monthWord = (m: number) => {
		if (m === 1) return "miesiąc";
		if (m >= 2 && m <= 4) return "miesiące";
		return "miesięcy";
	};

	if (normalizedMonths === 0) return `${normalizedYears} ${yearWord(normalizedYears)}`;
	if (normalizedYears === 0) return `${normalizedMonths} ${monthWord(normalizedMonths)}`;
	return `${normalizedYears} ${yearWord(normalizedYears)} i ${normalizedMonths} ${monthWord(normalizedMonths)}`;
}