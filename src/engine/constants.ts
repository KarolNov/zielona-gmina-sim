import type { CommuneType } from "#/lib/types";

/** Czas zycia projektu w latach */
export const PROJECT_LIFETIME = 25;

/** Stopa dyskontowa (WACC) dla obliczen NPV/LCOE */
export const DISCOUNT_RATE = 0.06;

/**
 * Progi cenowe CAPEX za kWp w zaleznosci od skali instalacji.
 * Wieksze instalacje maja nizszy koszt jednostkowy (ekonomia skali).
 */
export const CAPEX_TIERS = [
  { maxKwp: 10, costPerKwp: 4000 },
  { maxKwp: 50, costPerKwp: 3500 },
  { maxKwp: 100, costPerKwp: 3200 },
  { maxKwp: Infinity, costPerKwp: 2800 },
] as const;

/** Koszt magazynu energii za kWh pojemnosci (PLN/kWh) — ceny 2025/2026 */
export const STORAGE_COST_PER_KWH = 2000;

// ---------------------------------------------------------------------------
// Koszty utrzymania (OPEX) — skladniki roczne
// ---------------------------------------------------------------------------

/** Serwisowanie i czyszczenie paneli (PLN/kWp/rok) */
export const MAINTENANCE_SERVICING_PER_KWP = 40;

/** Ubezpieczenie majatkowe jako ulamek CAPEX brutto rocznie (0.4%) */
export const MAINTENANCE_INSURANCE_RATE = 0.004;

/** Rezerwa na naprawy jako ulamek CAPEX brutto rocznie (0.2%) */
export const MAINTENANCE_REPAIRS_RATE = 0.002;

/** Monitoring i zuzycie wlasne — stala kwota roczna (PLN) */
export const MAINTENANCE_MONITORING_FLAT = 600;

/** Roczna eskalacja kosztow utrzymania (2% — inflacja) */
export const MAINTENANCE_ESCALATION = 0.02;

// ---------------------------------------------------------------------------
// Wymiana inwertera (jednorazowa)
// ---------------------------------------------------------------------------

/** Rok wymiany inwertera (typowa zywotnosc 10-15 lat) */
export const INVERTER_REPLACEMENT_YEAR = 12;

/** Koszt wymiany inwertera (PLN/kWp) — ok. 15% kosztu instalacji PV */
export const INVERTER_REPLACEMENT_PER_KWP = 500;

/**
 * Bazowy wspolczynnik autokonsumpcji wg rozmiaru gminy (bez magazynu).
 * Wieksze gminy maja wiecej obciazen dziennych (szkoly, urzedy, pompownie).
 */
export const BASE_AUTOCONSUMPTION: Record<CommuneType, number> = {
  small: 0.3,
  medium: 0.4,
  large: 0.5,
};

/**
 * Ile punktow procentowych autokonsumpcji dodaje kazdy kWh magazynu
 * na 1 kWp mocy zainstalowanej.
 *
 * Wartosc 0.20 oznacza, ze magazyn o pojemnosci 0.5 kWh/kWp
 * podnosi autokonsumpcje o ~10pp, a 1.0 kWh/kWp o ~20pp.
 * Odzwierciedla przesuwanie zuzycia na godziny wieczorne/nocne
 * (peak shaving, time-of-use arbitrage).
 */
export const STORAGE_AUTOCONSUMPTION_BOOST_PER_KWH_PER_KWP = 0.20;

/** Maksymalny wspolczynnik autokonsumpcji (cap) */
export const MAX_AUTOCONSUMPTION = 0.9;

/**
 * Poziom autokonsumpcji osiagalny bez magazynu energii — wylacznie
 * przez harmonogramowanie obciazen (pompownie, oswietlenie, klimatyzacja).
 */
export const AC_NO_STORAGE_BASELINE = 0.5;

/**
 * Asymptota AC w modelu wymaganego magazynu (musi byc > MAX_AUTOCONSUMPTION).
 * Im blizej target_AC do tej wartosci, tym szybciej rosnie wymagany magazyn.
 */
export const AC_STORAGE_ASYMPTOTE = 0.95;

/**
 * Skala wymagania magazynu (kWh/kWp) w funkcji logarytmicznej:
 *   storage_per_kwp = SCALE × (−ln(1 − (target − baseline)/(asymptote − baseline)))
 *
 * Wzrost AC o kazdy punkt procentowy zwieksza koszt nieliniowo:
 * pierwsze pp powyzej baseline sa tanie, kolejne wymagaja coraz wiekszego
 * magazynu, az do nasycenia w okolicy AC_STORAGE_ASYMPTOTE.
 *
 * Wieksze wartosci -> ostrzejszy wzrost kosztu, mocniejsze wyplaszczenie
 * krzywej PBP/NPV przy wysokim AC.
 */
export const STORAGE_REQUIREMENT_SCALE_KWH_PER_KWP = 0.3;

/**
 * Wspolczynnik opustu dla spoldzielni energetycznej (stosunek 1:0,6).
 *
 * Wynika z art. 38c Ustawy o OZE (Dz.U. 2015 poz. 478 z pozn. zm.):
 * za kazde 1 kWh wprowadzone do sieci przez spoldzielnie, jej czlonkowie
 * moga odebrac 0,6 kWh bez oplat za energie i zmiennych oplat dystrybucyjnych.
 */
export const NET_METERING_RATIO = 0.6;
