import type { CommuneType } from "#/lib/types";

/** Parametry wejsciowe symulacji zebrane z UI */
export interface SimulationInput {
  /** Moc zainstalowana w kWp */
  pvPower: number;
  /** Roczna degradacja paneli jako ulamek dziesietny (np. 0.005 = 0.5%) */
  degradacja: number;
  /** Cena zakupu energii z sieci w PLN/kWh (referencyjna, bez PV) */
  cenaEnergii: number;
  /** Cena importu energii dla prosumenta w PLN/kWh (z narzutami dystrybutora) */
  cenaEnergiiImport: number;
  /** Roczne zapotrzebowanie gminy na energie elektryczna (MWh/rok) */
  annualDemand: number;
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
  /** Miesieczne uzyski z PVGIS (tablica 12 elementow, kWh) */
  monthlyYields: number[];
  /** Roczny uzysk z PVGIS (kWh) */
  annualYield: number;
  /** Czy finansowanie kredytem jest wlaczone */
  loanEnabled: boolean;
  /** Roczna stopa procentowa kredytu jako ulamek dziesietny (np. 0.07 = 7%) */
  loanRate: number;
  /** Okres kredytu w latach */
  loanTerm: number;
  /** Jaki procent wkladu wlasnego (CAPEX po dotacji) jest finansowany kredytem (0-100) */
  loanShare: number;
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

/** Rozbicie rocznych kosztow operacyjnych na skladniki */
export interface OpexBreakdown {
  /** Serwisowanie i czyszczenie (PLN) */
  servicing: number;
  /** Ubezpieczenie (PLN) */
  insurance: number;
  /** Naprawy (PLN) */
  repairs: number;
  /** Monitoring i zuzycie wlasne (PLN) */
  monitoring: number;
  /** Suma rocznych kosztow operacyjnych (PLN) */
  total: number;
}

/** Pojedynczy wiersz tabeli cash flow rok po roku */
export interface AnnualCashFlowRow {
  year: number;
  energyGenerated: number;
  energySelfConsumed: number;
  energyExported: number;
  /** Unikniety koszt energii zuzytej z PV po cenie bazowej (PLN) */
  savings: number;
  /** Wartosc opustu (energia odebrana z sieci za darmo) po cenie bazowej (PLN) */
  exportRevenue: number;
  /**
   * Narzut prosumencki na rezydualnym imporcie z sieci (PLN, dodatnia liczba = koszt).
   * (annualDemand - selfConsumed - opustCreditUsed) × (importPrice - gridPrice)
   */
  prosumerSurcharge: number;
  /** Energia rezydualnie importowana z sieci po wykorzystaniu opustu (kWh) */
  residualImport: number;
  opex: number;
  /** Rozbicie OPEX na skladniki */
  opexBreakdown: OpexBreakdown;
  /** Koszt wymiany inwertera w danym roku (PLN), 0 poza rokiem wymiany */
  inverterReplacement: number;
  /** Rata kredytu w danym roku (PLN), 0 jesli brak kredytu lub po splacie */
  loanPayment: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  gridPrice: number;
  exportPrice: number;
}

/** Wynik CAPEX */
export interface CapexResult {
  pvCost: number;
  storageCost: number;
  totalCapex: number;
}

/** Pelne wyniki symulacji — perspektywa wlasciciela (z kredytem gdy wlaczony) */
export interface SimulationResult {
  capex: number;
  capexAfterSubsidy: number;
  storageCost: number;
  annualOpex: number;
  /** Rozbicie OPEX pierwszego roku na skladniki */
  annualOpexBreakdown: OpexBreakdown;
  /** Calkowity koszt wymiany inwertera (PLN) */
  inverterReplacementCost: number;
  /** Rok wymiany inwertera */
  inverterReplacementYear: number;
  autoconsumptionRate: number;
  /** LCOE w PLN/kWh (uwzglednia koszty kredytu gdy wlaczony) */
  lcoe: number;
  npv: number;
  irr: number;
  paybackYears: number;
  /** Kwota kredytu (PLN), 0 jesli brak */
  loanPrincipal: number;
  /** Roczna rata kredytu (PLN), 0 jesli brak */
  loanAnnualPayment: number;
  cashFlowTable: AnnualCashFlowRow[];
  monthlyProductionYear1: MonthlyProduction[];
}
