# Model finansowy spółdzielni energetycznej

Dokumentacja silnika obliczeniowego (`src/engine/`) symulatora zwrotu
inwestycji w spółdzielczą instalację fotowoltaiczną na terenie gminy.

Silnik składa się z czystych funkcji (pure functions) bez efektów ubocznych.
Dane wejściowe zbierane są z UI i z API PVGIS; wyniki zasilają tabelę
cash flow rok po roku oraz wykresy.

---

## 1. Parametry wejściowe

| Kategoria | Parametr | Jednostka | Źródło |
|-----------|----------|-----------|--------|
| **Techniczne** | Moc zainstalowana (`pvPower`) | kWp | UI |
| | Kąt nachylenia paneli | ° | UI |
| | Roczna degradacja paneli (`degradacja`) | % / rok | UI (domyślnie 0,5%) |
| | Magazyn energii (`storageCapacity`) | kWh | UI (% mocy PV) |
| **Energetyczne** | Roczny uzysk (`annualYield`) | kWh | PVGIS |
| | Uzyski miesięczne (`monthlyYields`) | kWh × 12 | PVGIS |
| **Finansowe** | Cena energii z sieci (`cenaEnergii`) | PLN/kWh | UI (domyślnie 0,85) |
| | Cena sprzedaży nadwyżek (`cenaSprzedazy`) | PLN/kWh | UI (domyślnie 0,40) |
| | Inflacja ceny energii (`inflacjaEnergii`) | % / rok | UI (domyślnie 3%) |
| | Dofinansowanie (`donation`) | % CAPEX | UI |
| **Profilowe** | Rozmiar gminy (`communeSize`) | small / medium / large | UI |

Dane z PVGIS są już przeskalowane do zadanej mocy i kąta nachylenia —
silnik nakłada na nie jedynie degradację.

---

## 2. Bilans energetyczny

### 2.1 Produkcja roczna z degradacją

$$E_{gen}(t) = E_{pvgis} \cdot (1 - d)^{t}$$

| Symbol | Znaczenie |
|--------|-----------|
| $E_{pvgis}$ | Roczny uzysk z PVGIS dla pełnej mocy instalacji (kWh) |
| $d$ | Roczna degradacja paneli (ułamek, np. 0,005) |
| $t$ | Rok eksploatacji (0 = pierwszy rok, brak degradacji) |

Produkcja miesięczna obliczana analogicznie — każdy z 12 uzysków
miesięcznych mnożony przez $(1 - d)^t$.

**Implementacja:** `getMonthlyProduction()`, `getAnnualProduction()` w `production.ts`

### 2.2 Podział: autokonsumpcja vs. eksport

$$E_{auto}(t) = E_{gen}(t) \cdot \alpha$$

$$E_{exp}(t) = E_{gen}(t) \cdot (1 - \alpha)$$

Gdzie $\alpha$ to współczynnik autokonsumpcji (patrz sekcja 3).

---

## 3. Model autokonsumpcji

Model uproszczony (bez symulacji godzinowej). Bazowy współczynnik zależy
od rozmiaru gminy — większe gminy mają więcej obciążeń dziennych
(szkoły, urzędy, pompownie wodociągowe):

| Rozmiar gminy | Baza $\alpha_0$ |
|---------------|-----------------|
| Mała (< 10 000 mieszkańców) | 30% |
| Średnia (10 000–50 000) | 40% |
| Duża (> 50 000) | 50% |

Magazyn energii podnosi autokonsumpcję:

$$\alpha = \min\!\left(\alpha_0 + \frac{S_{kWh}}{P_{kWp}} \cdot 0{,}08,\; 0{,}90\right)$$

| Symbol | Znaczenie |
|--------|-----------|
| $S_{kWh}$ | Pojemność magazynu (kWh) |
| $P_{kWp}$ | Moc instalacji (kWp) |
| 0,08 | Przyrost autokonsumpcji na każdy kWh/kWp pojemności |
| 0,90 | Cap — maksymalny realistyczny poziom |

**Implementacja:** `getAutoconsumptionRate()` w `autoconsumption.ts`

---

## 4. Koszty inwestycyjne (CAPEX)

### 4.1 Instalacja PV — ceny progowe

Większe instalacje mają niższy koszt jednostkowy (ekonomia skali):

| Skala instalacji | Koszt PLN / kWp |
|------------------|-----------------|
| do 10 kWp | 5 500 |
| do 50 kWp | 5 000 |
| do 200 kWp | 4 500 |
| powyżej 200 kWp | 4 000 |

### 4.2 Magazyn energii

Koszt: **2 500 PLN / kWh** pojemności.

### 4.3 Dofinansowanie

$$CAPEX_{netto} = CAPEX_{brutto} \cdot \left(1 - \frac{dotacja\%}{100}\right)$$

**Implementacja:** `calculateCapex()`, `applySubsidy()` w `capex.ts`

---

## 5. Koszty operacyjne (OPEX)

OPEX stanowi 1,5% początkowego CAPEX brutto rocznie i rośnie o 2% r/r
(eskalacja kosztów serwisu, ubezpieczeń, zarządzania):

$$OPEX(t) = CAPEX_{brutto} \cdot 0{,}015 \cdot (1{,}02)^{t}$$

**Implementacja:** `calculateOpex()` w `opex.ts`

---

## 6. Harmonogram przepływów pieniężnych

Tabela generowana na 25 lat. Konwencja:
- **Rok 0** — inwestycja (wypływ CAPEX netto po dotacji, brak produkcji)
- **Rok 1..25** — eksploatacja

Dla każdego roku eksploatacji $t$ (gdzie $t \geq 1$):

| Pozycja | Formuła |
|---------|---------|
| Produkcja | $E_{gen}(t-1)$ (rok 1 = 0 lat degradacji) |
| Cena zakupu z sieci | $c_{grid} \cdot (1 + i)^{t-1}$ |
| Cena sprzedaży | $c_{sell} \cdot (1 + i)^{t-1}$ |
| Oszczędności | $E_{auto} \cdot c_{grid}(t)$ |
| Przychód z eksportu | $E_{exp} \cdot c_{sell}(t)$ |
| OPEX | $OPEX(t-1)$ |
| **Net Cash Flow** | Oszczędności + Przychód − OPEX |
| **Cumulative CF** | $\sum_{k=0}^{t} NCF_k$ |

**Implementacja:** `buildCashFlowTable()` w `cashflow.ts`

---

## 7. Wskaźniki efektywności (KPI)

### 7.1 LCOE — Zrównoważony Koszt Energii

$$LCOE = \frac{\displaystyle CAPEX_{netto} + \sum_{t=1}^{n} \frac{OPEX(t)}{(1+r)^t}}{\displaystyle \sum_{t=1}^{n} \frac{E_{gen}(t)}{(1+r)^t}}$$

Wynik w PLN/kWh. Powinien być znacznie niższy niż cena zakupu z sieci.

**Implementacja:** `calculateLCOE()` w `lcoe.ts`

### 7.2 PBP — Prosty czas zwrotu

$$PBP = t_{-} + \frac{|CF_{cum}(t_{-})|}{CF_{cum}(t_{+}) - CF_{cum}(t_{-})}$$

Gdzie $t_{-}$ to ostatni rok z ujemnym skumulowanym CF, a $t_{+}$
pierwszy rok z dodatnim. Interpolacja liniowa daje wynik ułamkowy (np. 8,3 lat).

Jeśli CF nigdy nie wychodzi na plus w ciągu 25 lat — zwraca `Infinity`.

**Implementacja:** `calculatePaybackPeriod()` w `cashflow.ts`

### 7.3 NPV — Wartość Bieżąca Netto

$$NPV = \sum_{t=0}^{n} \frac{CF_t}{(1+r)^t}$$

NPV > 0 oznacza projekt opłacalny przy danym koszcie kapitału ($r$ = WACC = 6%).

**Implementacja:** `calculateNPV()` w `kpi.ts`

### 7.4 IRR — Wewnętrzna Stopa Zwrotu

IRR to stopa $r$ dla której:

$$\sum_{t=0}^{n} \frac{CF_t}{(1+r)^t} = 0$$

Obliczana metodą Newtona-Raphsona (przybliżenie startowe 10%, maks. 100 iteracji).
IRR powinna być wyższa niż oprocentowanie lokat lub kredytu.

**Implementacja:** `calculateIRR()` w `kpi.ts`

---

## 8. Stałe modelu

Zdefiniowane w `constants.ts`. Wartości domyślne oparte o polski rynek (2024–2025):

| Stała | Wartość | Opis |
|-------|---------|------|
| `PROJECT_LIFETIME` | 25 | Okres życia projektu (lata) |
| `DISCOUNT_RATE` | 0,06 | Stopa dyskontowa / WACC |
| `CAPEX_TIERS` | 5 500 / 5 000 / 4 500 / 4 000 | PLN/kWp wg skali |
| `STORAGE_COST_PER_KWH` | 2 500 | PLN/kWh magazynu |
| `OPEX_RATE` | 0,015 | OPEX jako ułamek CAPEX |
| `OPEX_ESCALATION` | 0,02 | Roczna eskalacja OPEX |
| `BASE_AUTOCONSUMPTION` | 0,30 / 0,40 / 0,50 | Baza wg rozmiaru gminy |
| `STORAGE_BOOST` | 0,08 | pp autokonsumpcji na kWh/kWp |
| `MAX_AUTOCONSUMPTION` | 0,90 | Górny limit autokonsumpcji |

---

## 9. Orkiestrator

Funkcja `runSimulation()` w `index.ts` łączy wszystkie moduły:

1. Oblicza autokonsumpcję (rozmiar gminy + magazyn)
2. Oblicza CAPEX (progi cenowe + magazyn) i nakłada dotację
3. Buduje tabelę cash flow (25 lat z inflacją i degradacją)
4. Oblicza KPI: LCOE, NPV, IRR, PBP
5. Generuje produkcję miesięczną pierwszego roku

Wynik (`SimulationResult`) zawiera wszystkie dane potrzebne do
renderowania tabeli rok po roku, wykresów i podsumowania KPI.

---

## 10. Ograniczenia i uproszczenia

- **Brak symulacji godzinowej** — autokonsumpcja modelowana współczynnikiem
  procentowym zamiast porównania profili produkcji i zużycia godzina po godzinie.
- **Inflacja symetryczna** — ta sama stopa inflacji stosowana do ceny zakupu
  i sprzedaży energii.
- **Stały współczynnik autokonsumpcji** — nie zmienia się w ciągu życia projektu
  (w rzeczywistości profil zużycia gminy może ewoluować).
- **CAPEX jednorazowy** — cały nakład w roku 0, brak etapowania inwestycji.
- **Brak kosztów finansowania** — model nie uwzględnia rat kredytu; WACC
  pełni rolę kosztu alternatywnego kapitału.
