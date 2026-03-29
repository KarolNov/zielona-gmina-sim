/**
 * Ostrzezenia o nierealistycznych wartosciach parametrow.
 *
 * W odrożnieniu od walidacji (ktora blokuje zapis), ostrzezenia
 * sa czysto informacyjne — wartosc jest akceptowana, ale uzytkownik
 * widzi zolty komunikat ze wartosc odbiega od realiow rynkowych PL 2024/25.
 */

export function warnCenaEnergii(v: number): string | null {
  if (v > 2.0) return `Cena ${v.toFixed(2)} PLN/kWh jest bardzo wysoka — realistyczny zakres to 1,10–1,30 PLN`;
  if (v < 0.5) return `Cena ${v.toFixed(2)} PLN/kWh jest bardzo niska — realistyczny zakres to 1,10–1,30 PLN`;
  if (v > 1.5) return "Cena powyżej 1,50 PLN/kWh — upewnij się, że uwzględniasz realną stawkę";
  return null;
}

export function warnCenaSprzedazy(v: number, cenaEnergii: number): string | null {
  if (v > 0.8) return `Cena sprzedaży ${v.toFixed(2)} PLN/kWh jest nierealistycznie wysoka — RCEm oscyluje w granicach 0,35–0,45 PLN`;
  if (v >= cenaEnergii * 0.8) return "Cena sprzedaży zbliżona do ceny zakupu — w net-billingu jest zazwyczaj 3-4× niższa";
  if (v > 0.55) return "Cena sprzedaży powyżej 0,55 PLN/kWh — realistyczny zakres to 0,35–0,45 PLN";
  return null;
}

export function warnInflacja(v: number): string | null {
  if (v > 8) return `Inflacja ${v}%/rok jest ekstremalnie wysoka — realistyczny zakres to 3–5%`;
  if (v > 5) return "Inflacja powyżej 5%/rok — w perspektywie 25 lat to bardzo agresywne założenie";
  return null;
}

export function warnDegradacja(v: number): string | null {
  if (v > 1) return `Degradacja ${v}%/rok jest bardzo wysoka — panele Tier 1 tracą 0,4–0,5%/rok`;
  return null;
}

export function warnDonation(v: number): string | null {
  if (v > 80) return `Dofinansowanie ${v}% jest nietypowo wysokie — standardowe programy oferują 30–60%`;
  return null;
}

export function warnLoanRate(v: number): string | null {
  if (v > 12) return `Oprocentowanie ${v}% jest bardzo wysokie — kredyty na OZE to zazwyczaj 5–9%`;
  if (v < 2) return `Oprocentowanie ${v}% jest nierealistycznie niskie`;
  return null;
}
