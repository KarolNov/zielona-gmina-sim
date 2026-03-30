# Model finansowy spółdzielni energetycznej

Niniejszy dokument opisuje model finansowy służący ocenie opłacalności
inwestycji w spółdzielczą instalację fotowoltaiczną na terenie gminy.
Model obejmuje bilans energetyczny, analizę nakładów inwestycyjnych
i kosztów operacyjnych, opcjonalne finansowanie kredytowe, harmonogram
przepływów pieniężnych oraz wskaźniki efektywności ekonomicznej.

Wszystkie obliczenia prowadzone są z perspektywy właściciela instalacji —
uwzględniają dotacje, koszty obsługi kredytu oraz inflację cen energii.

---

## 1. Parametry wejściowe

| Kategoria | Parametr | Jednostka | Źródło |
|-----------|----------|-----------|--------|
| **Techniczne** | Moc zainstalowana | kWp | dane użytkownika |
| | Roczna degradacja paneli | % / rok | dane użytkownika (domyślnie 0,5%) |
| | Włączenie magazynu energii | tak / nie | dane użytkownika |
| | Pojemność magazynu energii | kWh | dane użytkownika |
| **Energetyczne** | Roczny uzysk energetyczny | kWh | baza PVGIS (JRC) |
| | Rozkład uzysku miesięcznego | kWh × 12 | baza PVGIS (JRC) |
| **Finansowe** | Cena zakupu energii z sieci | PLN/kWh | dane użytkownika (domyślnie 0,85) |
| | Cena sprzedaży nadwyżek do sieci | PLN/kWh | dane użytkownika (domyślnie 0,40) |
| | Roczna inflacja ceny energii | % / rok | dane użytkownika (domyślnie 3%) |
| | Dofinansowanie (dotacja) | % CAPEX | dane użytkownika |
| **Finansowanie kredytowe** | Włączenie finansowania kredytowego | tak / nie | dane użytkownika |
| | Roczna stopa oprocentowania kredytu | % | dane użytkownika |
| | Okres kredytowania | lata | dane użytkownika |
| | Udział kredytu w wkładzie własnym | % (0–100) | dane użytkownika |
| **Profilowe** | Rozmiar gminy | mała / średnia / duża | dane użytkownika |

Dane z bazy PVGIS są przeskalowane do zadanej mocy i kąta nachylenia paneli —
model nakłada na nie wyłącznie współczynnik degradacji.

---

## 2. Bilans energetyczny

### 2.1 Produkcja roczna z degradacją

$$E_{gen}(t) = E_{pvgis} \cdot (1 - d)^{t}$$

| Symbol | Znaczenie |
|--------|-----------|
| $E_{pvgis}$ | Roczny uzysk energetyczny z bazy PVGIS dla pełnej mocy instalacji (kWh) |
| $d$ | Roczna degradacja paneli (ułamek, np. 0,005) |
| $t$ | Rok eksploatacji (0 = pierwszy rok, brak degradacji) |

Produkcja miesięczna obliczana analogicznie — każdy z 12 uzysków
miesięcznych mnożony przez $(1 - d)^t$.

### 2.2 Podział: autokonsumpcja vs. eksport

$$E_{auto}(t) = E_{gen}(t) \cdot \alpha$$

$$E_{exp}(t) = E_{gen}(t) \cdot (1 - \alpha)$$

Gdzie $\alpha$ to współczynnik autokonsumpcji (patrz sekcja 3).

---

## 3. Model autokonsumpcji

Model uproszczony (bez symulacji godzinowej). Bazowy współczynnik zależy
od rozmiaru gminy — większe gminy charakteryzują się wyższym obciążeniem
dziennym (placówki oświatowe, obiekty administracyjne, przepompownie
wodociągowe):

| Rozmiar gminy | Baza $\alpha_0$ |
|---------------|-----------------|
| Mała (< 10 000 mieszkańców) | 30% |
| Średnia (10 000–50 000) | 40% |
| Duża (> 50 000) | 50% |

Magazyn energii podnosi autokonsumpcję poprzez przesunięcie zużycia na
godziny wieczorne i nocne (peak shaving, arbitraż czasowy):

$$\alpha = \min\!\left(\alpha_0 + \frac{S_{kWh}}{P_{kWp}} \cdot 0{,}20,\; 0{,}90\right)$$

| Symbol | Znaczenie |
|--------|-----------|
| $S_{kWh}$ | Pojemność magazynu (kWh) |
| $P_{kWp}$ | Moc instalacji (kWp) |
| 0,20 | Współczynnik przyrostu autokonsumpcji na jednostkę pojemności względnej magazynu (kWh/kWp) |
| 0,90 | Górny limit — maksymalny realistyczny poziom autokonsumpcji |

---

## 4. Nakłady inwestycyjne (CAPEX)

### 4.1 Instalacja fotowoltaiczna — progi kosztowe

Większe instalacje charakteryzują się niższym kosztem jednostkowym
(korzyści skali):

| Skala instalacji | Koszt PLN / kWp |
|------------------|-----------------|
| do 10 kWp | 4 000 |
| do 50 kWp | 3 500 |
| do 200 kWp | 3 200 |
| powyżej 200 kWp | 2 800 |

### 4.2 Magazyn energii

Koszt: **2 000 PLN / kWh** pojemności.

### 4.3 Dofinansowanie

$$CAPEX_{netto} = CAPEX_{brutto} \cdot \left(1 - \frac{dotacja\%}{100}\right)$$

---

## 5. Koszty operacyjne (OPEX)

Koszty eksploatacyjne składają się z czterech kategorii kosztów
powtarzalnych oraz jednorazowej wymiany inwertera.

### 5.1 Koszty powtarzalne (roczne)

| Kategoria | Baza | Wartość | Typ |
|-----------|------|---------|-----|
| Serwisowanie / czyszczenie | PLN/kWp/rok | 40 | proporcjonalny do mocy |
| Ubezpieczenie | % CAPEX brutto | 0,4% | proporcjonalny do wartości instalacji |
| Naprawy | % CAPEX brutto | 0,2% | rezerwa na naprawy komponentów |
| Monitoring | PLN/rok | 600 | stały (platforma monitoringu) |

Każdy składnik podlega rocznej eskalacji 2% (inflacja kosztów usług
i materiałów):

$$OPEX_i(t) = OPEX_i^{bazowy} \cdot (1{,}02)^{t}$$

$$OPEX(t) = \sum_i OPEX_i(t)$$

### 5.2 Wymiana inwertera (jednorazowa)

Inwerter wymaga wymiany po ok. 10–15 latach eksploatacji. Model
uwzględnia jednorazowy koszt wymiany w roku 12:

$$K_{inwerter} = P_{kWp} \cdot 500 \text{ PLN/kWp}$$

Koszt ten jest uwzględniony w przepływach pieniężnych roku 12
oraz w liczniku LCOE.

---

## 6. Finansowanie kredytowe

Model uwzględnia opcjonalne finansowanie zewnętrzne w formie kredytu
annuitetowego (raty równe). Kredytem objęty jest wskazany przez
użytkownika udział procentowy wkładu własnego, tj. CAPEX netto po
odjęciu dotacji.

### 6.1 Kwota kredytu

$$K = CAPEX_{netto} \cdot \frac{u}{100}$$

| Symbol | Znaczenie |
|--------|-----------|
| $K$ | Kwota kredytu (kapitał) |
| $u$ | Udział kredytu w wkładzie własnym (%) |

### 6.2 Rata annuitetowa

$$R = K \cdot \frac{r \cdot (1+r)^n}{(1+r)^n - 1}$$

| Symbol | Znaczenie |
|--------|-----------|
| $R$ | Roczna rata kredytu (PLN) |
| $r$ | Roczna stopa oprocentowania (ułamek, np. 0,07) |
| $n$ | Okres kredytowania (lata) |

W przypadku kredytu bezodsetkowego ($r = 0$) formuła redukuje się do:

$$R = \frac{K}{n}$$

Raty kredytowe obciążają przepływy pieniężne w latach $1 \leq t \leq n$.
Po upływie okresu kredytowania rata wynosi zero.

---

## 7. Harmonogram przepływów pieniężnych

Tabela generowana na 25 lat. Konwencja:
- **Rok 0** — wypływ wkładu własnego. W przypadku finansowania kredytowego
  jest to CAPEX netto pomniejszony o kwotę kredytu; bez kredytu — pełny
  CAPEX netto po dotacji. Brak produkcji energii.
- **Rok 1..25** — eksploatacja

Dla każdego roku eksploatacji $t$ (gdzie $t \geq 1$):

| Pozycja | Formuła |
|---------|---------|
| Produkcja | $E_{gen}(t-1)$ (rok 1 = 0 lat degradacji) |
| Cena zakupu z sieci | $c_{grid} \cdot (1 + i)^{t-1}$ |
| Cena sprzedaży | $c_{sell} \cdot (1 + i)^{t-1}$ |
| Oszczędności | $E_{auto} \cdot c_{grid}(t)$ |
| Przychód z eksportu | $E_{exp} \cdot c_{sell}(t)$ |
| OPEX | $OPEX(t-1)$ (suma 4 składników z eskalacją) |
| Wymiana inwertera | $K_{inwerter}$ w roku 12, $0$ w pozostałych |
| Rata kredytu | $R$ dla $t \leq n_{kredyt}$, $0$ dla $t > n_{kredyt}$ |
| **Przepływ netto** | Oszczędności + Przychód z eksportu − OPEX − Inwerter − Rata kredytu |
| **Skumulowany przepływ** | $\sum_{k=0}^{t} CF_k$ |

---

## 8. Wskaźniki efektywności ekonomicznej

### 8.1 LCOE — Znormalizowany Koszt Energii

$$LCOE = \frac{\displaystyle CAPEX_{netto} + \sum_{t=1}^{n} \frac{OPEX(t) + K_{inwerter}(t)}{(1+r)^t}}{\displaystyle \sum_{t=1}^{n} \frac{E_{gen}(t)}{(1+r)^t}}$$

Gdzie $K_{inwerter}(t)$ wynosi $P_{kWp} \cdot 500$ w roku wymiany (12)
i zero w pozostałych latach.

Wynik wyrażony w PLN/kWh. Wartość powinna być istotnie niższa niż cena
zakupu energii z sieci, co potwierdza konkurencyjność kosztową instalacji.

**Wariant z finansowaniem kredytowym.** Gdy kredyt jest aktywny, w liczniku
uwzględnia się wkład własny oraz zdyskontowane koszty operacyjne, wymianę
inwertera i raty:

$$LCOE_{kredyt} = \frac{\displaystyle W_0 + \sum_{t=1}^{n} \frac{OPEX(t) + K_{inwerter}(t) + R(t)}{(1+r)^t}}{\displaystyle \sum_{t=1}^{n} \frac{E_{gen}(t)}{(1+r)^t}}$$

| Symbol | Znaczenie |
|--------|-----------|
| $W_0$ | Wkład własny właściciela (CAPEX netto minus kwota kredytu) |
| $R(t)$ | Rata kredytu w roku $t$ (zero po upływie okresu kredytowania) |
| $K_{inwerter}(t)$ | Koszt wymiany inwertera w roku $t$ (niezerowy tylko w roku 12) |

### 8.2 PBP — Prosty okres zwrotu

$$PBP = t_{-} + \frac{|CF_{cum}(t_{-})|}{CF_{cum}(t_{+}) - CF_{cum}(t_{-})}$$

Gdzie $t_{-}$ to ostatni rok z ujemnym skumulowanym przepływem pieniężnym,
a $t_{+}$ pierwszy rok z dodatnim. Interpolacja liniowa daje wynik
ułamkowy (np. 8,3 lat).

Jeżeli skumulowany przepływ pieniężny nie osiąga wartości dodatniej
w horyzoncie 25 lat, okres zwrotu uznaje się za nieosiągalny.

### 8.3 NPV — Wartość Bieżąca Netto

$$NPV = \sum_{t=0}^{n} \frac{CF_t}{(1+r)^t}$$

NPV > 0 oznacza, że projekt jest opłacalny przy przyjętym koszcie
kapitału ($r$ = WACC = 6%). Przepływy $CF_t$ uwzględniają perspektywę
właściciela, tj. raty kredytu gdy finansowanie jest aktywne.

### 8.4 IRR — Wewnętrzna Stopa Zwrotu

IRR to stopa dyskontowa $r$, dla której:

$$\sum_{t=0}^{n} \frac{CF_t}{(1+r)^t} = 0$$

Obliczana metodą Newtona–Raphsona (przybliżenie startowe 10%,
maks. 100 iteracji, tolerancja $10^{-6}$). IRR powinna przekraczać
oprocentowanie alternatywnych form lokowania kapitału (lokaty, obligacje)
lub koszt pozyskania finansowania dłużnego.

---

## 9. Stałe modelu

Wartości domyślne oparte o polski rynek energetyki odnawialnej (2025/2026):

| Parametr | Wartość | Opis |
|----------|---------|------|
| Horyzont inwestycji | 25 | Okres życia projektu (lata) |
| Stopa dyskontowa | 0,06 | WACC przyjęty do dyskontowania przepływów |
| Progi kosztowe CAPEX | 4 000 / 3 500 / 3 200 / 2 800 | PLN/kWp wg skali instalacji |
| Koszt magazynu energii | 2 000 | PLN/kWh pojemności |
| Serwisowanie / czyszczenie | 40 PLN/kWp/rok | Przeglądy i czyszczenie paneli |
| Ubezpieczenie | 0,004 | 0,4% CAPEX brutto rocznie |
| Naprawy | 0,002 | 0,2% CAPEX brutto rocznie |
| Monitoring | 600 PLN/rok | Stała kwota — platforma monitoringu |
| Eskalacja kosztów utrzymania | 0,02 | Roczny wzrost kosztów operacyjnych |
| Wymiana inwertera | 500 PLN/kWp | Jednorazowa wymiana w roku 12 |
| Rok wymiany inwertera | 12 | Typowa żywotność inwertera |
| Bazowa autokonsumpcja | 0,30 / 0,40 / 0,50 | Współczynnik wg rozmiaru gminy (mała/średnia/duża) |
| Przyrost autokonsumpcji z magazynu | 0,20 | pp na każdy kWh/kWp pojemności względnej |
| Górny limit autokonsumpcji | 0,90 | Maksymalny osiągalny współczynnik |

---

## 10. Przebieg obliczeń

Symulacja realizowana jest w następujących krokach:

1. Wyznaczenie współczynnika autokonsumpcji na podstawie rozmiaru gminy
   i pojemności magazynu energii
2. Kalkulacja nakładów inwestycyjnych (progi kosztowe + magazyn)
   z uwzględnieniem dotacji
3. Obliczenie parametrów kredytu (kwota, rata annuitetowa) — jeśli
   finansowanie kredytowe jest aktywne
4. Budowa harmonogramu przepływów pieniężnych na 25 lat z uwzględnieniem
   inflacji cen energii, degradacji paneli, kosztów utrzymania (4 składniki
   z eskalacją), jednorazowej wymiany inwertera (rok 12) i rat kredytu
5. Obliczenie wskaźników efektywności ekonomicznej: LCOE, NPV, IRR, PBP
6. Wygenerowanie rozkładu produkcji miesięcznej dla pierwszego roku
   eksploatacji

Wynik obliczeń obejmuje pełną tabelę przepływów pieniężnych rok po roku,
rozkład produkcji miesięcznej oraz zestaw wskaźników umożliwiających
ocenę opłacalności inwestycji.

---

## 11. Ograniczenia i uproszczenia

- **Brak symulacji godzinowej** — autokonsumpcja modelowana współczynnikiem
  procentowym zamiast porównania profili produkcji i zużycia godzina po godzinie.
- **Inflacja symetryczna** — ta sama stopa inflacji stosowana do ceny zakupu
  i sprzedaży energii.
- **Stały współczynnik autokonsumpcji** — nie zmienia się w ciągu życia projektu
  (w rzeczywistości profil zużycia gminy może ewoluować).
- **CAPEX jednorazowy** — cały nakład w roku 0, brak etapowania inwestycji.
- **Uproszczony model kredytu** — annuitet o stałej stopie procentowej,
  bez uwzględnienia zmiennego oprocentowania, prowizji bankowych,
  kosztów zabezpieczeń ani opłat dodatkowych.
