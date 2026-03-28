export async function getSolarData(lat: number, lon: number, kwp: number = 1) {
  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${kwp}&loss=14&outputformat=json&hourly=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Błąd pobierania danych PVGIS: ${response.status}`);
  }

  const data = await response.json();

  // Keep the same returned shape: array of { time, production }
  return data.outputs.hourly.map((h: any) => ({
    time: h.time,
    production: h['P'], // Produkcja w Watach dla danej godziny
  }));
}

export interface SolarAverages {
  annualYield: number;      // Ile kWh wyprodukuje 1 kWp w rok
  monthlyYields: number[];  // Tablica 12 wartości (styczeń - grudzień)
  locationInfo: string;
}
/**
 * Pobiera roczne i miesięczne średnie produkcji energii dla danej lokalizacji.
 * PVGIS zwraca wartości już przeskalowane do podanej mocy i kąta nachylenia.
 *
 * @param lat - szerokość geograficzna
 * @param lon - długość geograficzna
 * @param kpw - moc instalacji w kWp (domyślnie 1)
 * @param angle - kąt nachylenia paneli w stopniach (domyślnie 35°)
 */
export async function getSolarSummary(lat: number, lon: number, kpw = 1, angle = 35): Promise<SolarAverages> {
  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${kpw}&loss=14&mountingplace=free&angle=${angle}&aspect=0&outputformat=json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Błąd pobierania danych z PVGIS');

  const data = await response.json();

  // 1. Wyciągamy sumę roczną (kWh)
  const annualYield = data.outputs.totals.fixed.E_y;

  // 2. Wyciągamy średnie miesięczne (kWh)
  const monthlyYields = data.outputs.monthly.fixed.map((m: any) => m.E_m);

  return {
    annualYield, // np. 1050
    monthlyYields, // [25, 45, 90, ..., 30]
    locationInfo: `${lat}, ${lon}`,
  };
}