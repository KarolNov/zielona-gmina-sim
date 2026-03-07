const MIESIACE = [
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