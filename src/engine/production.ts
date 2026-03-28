/**
 * Oblicza miesieczna produkcje energii elektrycznej dla danego roku projektu.
 *
 * Przyjmuje uzyski PVGIS juz przeskalowane dla zadanej mocy i kata nachylenia.
 * Naklada jedynie roczna degradacje paneli.
 *
 * @param monthlyYields - Tablica 12 wartosci kWh/miesiac z PVGIS (dla pelnej mocy instalacji)
 * @param degradacja - Roczna degradacja jako ulamek dziesietny (np. 0.005 = 0.5%)
 * @param year - Rok projektu (0 = pierwszy rok eksploatacji, brak degradacji)
 * @returns Tablica 12 wartosci kWh produkcji na miesiac z uwzglednieniem degradacji
 *
 * @example
 * ```ts
 * // PVGIS zwrocil dane dla 100 kWp:
 * const yields = [2500, 4500, 9000, 12000, 15000, 16000, 15500, 14000, 10000, 6500, 3000, 2000];
 * const monthly = getMonthlyProduction(yields, 0.005, 5);
 * // => kazda wartosc * (1 - 0.005)^5 ≈ 97.5% oryginalnej
 * ```
 */
export function getMonthlyProduction(
  monthlyYields: number[],
  degradacja: number,
  year: number,
): number[] {
  const degradationFactor = Math.pow(1 - degradacja, year);
  return monthlyYields.map(
    (monthYield) => monthYield * degradationFactor,
  );
}

/**
 * Oblicza calkowita roczna produkcje energii dla danego roku projektu.
 *
 * Przyjmuje roczny uzysk z PVGIS juz przeskalowany dla pelnej mocy instalacji.
 * Naklada formule degradacji: `E_gen(t) = annualYield × (1 - d)^t`
 *
 * @param annualYield - Roczny uzysk z PVGIS w kWh (dla pelnej mocy instalacji)
 * @param degradacja - Roczna degradacja jako ulamek dziesietny (np. 0.005 = 0.5%)
 * @param year - Rok projektu (0 = pierwszy rok eksploatacji)
 * @returns Calkowita energia wygenerowana w danym roku (kWh)
 *
 * @example
 * ```ts
 * // PVGIS zwrocil 105_000 kWh/rok dla 100 kWp
 * const annual = getAnnualProduction(105_000, 0.005, 5);
 * // => 105_000 * (1 - 0.005)^5 ≈ 102_393 kWh
 * ```
 */
export function getAnnualProduction(
  annualYield: number,
  degradacja: number,
  year: number,
): number {
  return annualYield * Math.pow(1 - degradacja, year);
}
