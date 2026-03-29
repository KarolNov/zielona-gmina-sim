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