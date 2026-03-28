import type { CommuneType } from "#/lib/types";

/** Parametry wejsciowe symulacji zebrane z UI */
export interface SimulationInput {
  /** Moc zainstalowana w kWp */
  pvPower: number;
  /** Roczna degradacja paneli jako ulamek dziesietny (np. 0.005 = 0.5%) */
  degradacja: number;
  /** Cena zakupu energii z sieci w PLN/kWh */
  cenaEnergii: number;
  /** Cena sprzedazy nadwyzek w PLN/kWh */
  cenaSprzedazy: number;
  /** Roczna inflacja ceny energii jako ulamek dziesietny (np. 0.03 = 3%) */
  inflacjaEnergii: number;
  /** Dofinansowanie jako procent CAPEX (0-100) */
  donation: number;
  /** Czy magazyn energii jest wlaczony */
  storageEnabled: boolean;
  /** Pojemnosc magazynu w kWh (0 jesli wylaczony) */
  storageCapacity: number;
  /** Rozmiar gminy */
  communeSize: CommuneType;
  /**
   * Miesieczne uzyski z PVGIS (tablica 12 elementow, kWh).
   * Juz przeskalowane dla zadanej mocy i kata nachylenia.
   */
  monthlyYields: number[];
  /**
   * Roczny uzysk z PVGIS (kWh).
   * Juz przeskalowany dla zadanej mocy i kata nachylenia.
   */
  annualYield: number;
}

/** Produkcja miesiecy dla pojedynczego roku */
export interface MonthlyProduction {
  /** Indeks miesiaca 0-11 */
  month: number;
  /** Calkowita wygenerowana energia w kWh */
  generated: number;
  /** Energia zuzyta na miejscu w kWh */
  selfConsumed: number;
  /** Energia wyeksportowana do sieci w kWh */
  exported: number;
}

/** Pojedynczy wiersz tabeli cash flow rok po roku */
export interface AnnualCashFlowRow {
  /** Rok projektu (0 = inwestycja) */
  year: number;
  /** Calkowita wygenerowana energia (kWh) */
  energyGenerated: number;
  /** Energia zuzyta na miejscu (kWh) */
  energySelfConsumed: number;
  /** Energia wyeksportowana (kWh) */
  energyExported: number;
  /** Oszczednosci z unikanego zakupu z sieci (PLN) */
  savings: number;
  /** Przychod ze sprzedazy nadwyzek (PLN) */
  exportRevenue: number;
  /** Koszty operacyjne w danym roku (PLN) */
  opex: number;
  /** Przeplywy pieniezne netto w danym roku (PLN) */
  netCashFlow: number;
  /** Skumulowane przeplywy pieniezne do danego roku (PLN) */
  cumulativeCashFlow: number;
  /** Cena energii z sieci w danym roku po inflacji (PLN/kWh) */
  gridPrice: number;
  /** Cena sprzedazy w danym roku po inflacji (PLN/kWh) */
  exportPrice: number;
}

/** Wynik CAPEX */
export interface CapexResult {
  /** Koszt instalacji PV (PLN) */
  pvCost: number;
  /** Koszt magazynu energii (PLN) */
  storageCost: number;
  /** Calkowity CAPEX (PLN) */
  totalCapex: number;
}

/** Pelne wyniki symulacji */
export interface SimulationResult {
  /** Calkowity CAPEX przed dotacja (PLN) */
  capex: number;
  /** CAPEX po odliczeniu dotacji (PLN) */
  capexAfterSubsidy: number;
  /** Koszt magazynu energii (PLN) */
  storageCost: number;
  /** Roczny OPEX w pierwszym roku (PLN) */
  annualOpex: number;
  /** Wspolczynnik autokonsumpcji (0..1) */
  autoconsumptionRate: number;
  /** LCOE w PLN/kWh */
  lcoe: number;
  /** NPV w PLN */
  npv: number;
  /** IRR jako ulamek dziesietny (np. 0.12 = 12%) */
  irr: number;
  /** Prosty czas zwrotu w latach */
  paybackYears: number;
  /** Tabela cash flow rok po roku */
  cashFlowTable: AnnualCashFlowRow[];
  /** Produkcja miesieczna w pierwszym roku eksploatacji */
  monthlyProductionYear1: MonthlyProduction[];
}
