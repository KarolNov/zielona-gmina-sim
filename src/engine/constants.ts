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
  { maxKwp: 200, costPerKwp: 3200 },
  { maxKwp: Infinity, costPerKwp: 2800 },
] as const;

/** Koszt magazynu energii za kWh pojemnosci (PLN/kWh) — ceny 2025/2026 */
export const STORAGE_COST_PER_KWH = 2000;

/** OPEX jako ulamek CAPEX rocznie (1%) */
export const OPEX_RATE = 0.01;

/** Roczna eskalacja kosztow OPEX (2%) */
export const OPEX_ESCALATION = 0.02;

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
