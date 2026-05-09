# Zielona Gmina Sim

Kalkulator opłacalności inwestycji w gminną spółdzielnię energetyczną (fotowoltaika).
Użytkownik wprowadza parametry techniczne i finansowe — aplikacja wizualizuje
25-letni harmonogram przepływów pieniężnych, wskaźniki LCOE / NPV / IRR / PBP
oraz analizę wrażliwości w czasie rzeczywistym.

Projekt powstał w ramach pracy licencjackiej z ekonomii.

## Dokumentacja modelu

Pełny opis modelu finansowego (bilans energetyczny, CAPEX, OPEX, kredyt,
cash flow, KPI, analiza wrażliwości) wraz ze źródłami danych i kontekstem
prawnym: **[docs/about-model.md](docs/about-model.md)**

## Architektura

```
src/
├── engine/           # Model finansowy (czyste funkcje, bez I/O)
│   ├── autoconsumption.ts   # Współczynnik autokonsumpcji (rozmiar gminy + magazyn)
│   ├── capex.ts             # Nakłady inwestycyjne (progi kosztowe, dotacja)
│   ├── cashflow.ts          # Harmonogram przepływów pieniężnych (25 lat)
│   ├── constants.ts         # Stałe modelu (CAPEX tiers, OPEX, opust, limity)
│   ├── kpi.ts               # NPV, IRR (Newton-Raphson)
│   ├── lcoe.ts              # Znormalizowany koszt energii
│   ├── loan.ts              # Kredyt annuitetowy
│   ├── opex.ts              # Koszty operacyjne (eskalacja + sinking fund)
│   ├── production.ts        # Produkcja z degradacją (roczna / miesięczna)
│   ├── sensitivity.ts       # Analiza wrażliwości (AC sweep, scenariusze cenowe)
│   └── types.ts             # Typy wejścia/wyjścia symulacji
├── components/       # Komponenty UI (Header, Footer, ThemeToggle)
├── lib/              # Narzędzia (fetch PVGIS, search params, walidacja)
├── routes/           # Strony (TanStack Router, file-based routing)
│   ├── index.tsx            # Główna strona kalkulatora
│   └── about.tsx            # O projekcie
└── styles.css        # Tailwind CSS
```

Dane nasłonecznienia pobierane są z API **PVGIS** (JRC, Komisja Europejska).
W produkcji proxy CORS realizowany jest przez Cloudflare Pages Function
(`functions/pvgis.ts`); w dev Vite proxy (`vite.config.ts`).

## Technologie

- **React 19** + **TanStack Start** (SSR, file-based routing)
- **Vite 7** (build + dev server)
- **Tailwind CSS 4** (stylowanie)
- **Recharts** (wykresy)
- **Leaflet** (mapa — wybór lokalizacji)
- **Valibot** (walidacja parametrów)
- **Cloudflare Pages** (hosting + edge proxy PVGIS)
- **Vitest** (testy) · **Biome** (lint + format)

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build i deploy

```bash
npm run build
npm run deploy     # Cloudflare Pages (wymaga CF_API_TOKEN)
```

## Testy i jakość kodu

```bash
npm test           # Vitest
npm run check      # Biome (lint + format)
```
