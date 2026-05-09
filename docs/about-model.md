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
| | Roczne zapotrzebowanie gminy | MWh / rok | dane użytkownika (domyślnie 1 000) |
| **Finansowe** | Cena bazowa energii (taryfa odbiorcy) | PLN/kWh | dane użytkownika (domyślnie 0,80) |
| | Cena importu prosumenckiego | PLN/kWh | dane użytkownika (domyślnie 0,92, ok. +15% nad bazową) |
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

Autokonsumpcja jest ograniczona przez rzeczywiste zapotrzebowanie gminy
(nie da się zużyć więcej energii niż się jej potrzebuje):

$$E_{auto}(t) = \min\!\left(E_{gen}(t) \cdot \alpha,\; D\right)$$

$$E_{exp}(t) = E_{gen}(t) - E_{auto}(t)$$

| Symbol | Znaczenie |
|--------|-----------|
| $\alpha$ | Współczynnik autokonsumpcji (patrz sekcja 3) |
| $D$ | Roczne zapotrzebowanie gminy (kWh/rok) |

### 2.3 Bilans importu rezydualnego

Po pokryciu zużycia z PV pozostaje rezydualne zapotrzebowanie, które
można częściowo skompensować opustem (sekcja 7.2). To, co nie zostanie
pokryte, kupowane jest po cenie prosumenckiej (z narzutem):

$$E_{res}(t) = D - E_{auto}(t) - E_{opust}(t)$$

Energia $E_{res}$ obciąża właściciela narzutem prosumenckim
(sekcja 7.3) — to kluczowy mechanizm różnicujący opłacalność przy
różnych poziomach autokonsumpcji.

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

$$\alpha_{raw} = \alpha_0 + \frac{S_{kWh}}{P_{kWp}} \cdot 0{,}20$$

Współczynnik jest następnie ograniczony dwoma capami:

$$\alpha = \min\!\left(\alpha_{raw},\; 0{,}90,\; \frac{D}{E_{gen,1}}\right)$$

| Symbol | Znaczenie |
|--------|-----------|
| $S_{kWh}$ | Pojemność magazynu (kWh) |
| $P_{kWp}$ | Moc instalacji (kWp) |
| 0,20 | Współczynnik przyrostu autokonsumpcji na jednostkę pojemności względnej magazynu (kWh/kWp) |
| 0,90 | Górny limit — maksymalny realistyczny poziom autokonsumpcji |
| $D$ | Roczne zapotrzebowanie gminy (kWh/rok) |
| $E_{gen,1}$ | Roczna produkcja z PV w pierwszym roku (kWh/rok) |

Cap $D/E_{gen,1}$ zapewnia, że autokonsumpcja nie przekroczy fizycznego
zapotrzebowania gminy — jeśli produkcja PV przewyższa zużycie,
nadwyżka musi trafić do sieci niezależnie od magazynu.

---

## 4. Nakłady inwestycyjne (CAPEX)

### 4.1 Instalacja fotowoltaiczna — progi kosztowe

Większe instalacje charakteryzują się niższym kosztem jednostkowym
(korzyści skali):

| Skala instalacji | Koszt PLN / kWp |
|------------------|-----------------|
| do 10 kWp | 4 000 |
| do 50 kWp | 3 500 |
| do 100 kWp | 3 200 |
| powyżej 100 kWp | 2 800 |

### 4.2 Magazyn energii

Koszt: **2 000 PLN / kWh** pojemności.

### 4.3 Dofinansowanie

$$CAPEX_{netto} = CAPEX_{brutto} \cdot \left(1 - \frac{dotacja\%}{100}\right)$$

---

## 5. Koszty operacyjne (OPEX)

Koszty eksploatacyjne składają się z czterech kategorii kosztów
powtarzalnych oraz rocznej rezerwy na wymianę inwertera.

### 5.1 Koszty powtarzalne (roczne, z eskalacją)

| Kategoria | Baza | Wartość | Typ |
|-----------|------|---------|-----|
| Serwisowanie / czyszczenie | PLN/kWp/rok | 40 | proporcjonalny do mocy |
| Ubezpieczenie | % CAPEX brutto | 0,4% | proporcjonalny do wartości instalacji |
| Naprawy | % CAPEX brutto | 0,2% | rezerwa na naprawy komponentów |
| Monitoring | PLN/rok | 600 | stały (platforma monitoringu) |

Każdy z powyższych składników podlega rocznej eskalacji 2% (inflacja
kosztów usług i materiałów):

$$OPEX_i(t) = OPEX_i^{bazowy} \cdot (1{,}02)^{t}$$

### 5.2 Rezerwa na wymianę inwertera (sinking fund)

Inwerter wymaga wymiany po ok. 10–15 latach eksploatacji. Zamiast
modelować jednorazowy wydatek w pojedynczym roku (co generuje sztuczny
„krater" w przepływach pieniężnych i nieliniowości w krzywej PBP),
koszt wymiany jest amortyzowany jako stała roczna rezerwa odkładana
przez cały okres życia projektu:

$$OPEX_{inv}(t) = \frac{P_{kWp} \cdot 500 \text{ PLN/kWp}}{n_{życia}}$$

Gdzie $n_{życia} = 25$ lat. Rezerwa nie podlega eskalacji (kwota
nominalna odkładana co roku do funduszu rezerwowego). Odpowiada
to praktyce księgowej spółdzielni budującej fundusz odnowieniowy
zamiast obciążania budżetu w jednym roku.

### 5.3 Sumaryczny OPEX

$$OPEX(t) = \sum_i OPEX_i(t) + OPEX_{inv}(t)$$

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

### 7.1 Dwie ceny energii — cena bazowa vs. cena prosumencka

Model rozróżnia dwie ceny energii elektrycznej:

| Symbol | Cena | Znaczenie |
|--------|------|-----------|
| $c_{base}$ | bazowa | Cena energii czynnej bez narzutów dla odbiorcy końcowego (bez PV) |
| $c_{imp}$ | prosumencka | Cena importu dla prosumenta — z narzutem dystrybutora (zwykle +10–20%) |

Sprzedawcy energii często podnoszą cenę zakupu energii dla odbiorców
posiadających własne źródło (taryfy prosumenckie, opłata jakościowa,
narzut na opłatę handlową). W modelu odzwierciedla to różnica
$c_{imp} - c_{base}$ — narzut prosumencki obciążający rezydualny
import z sieci (sekcja 7.3).

Obie ceny rosną z tą samą roczną stopą inflacji $i$:

$$c_{base}(t) = c_{base} \cdot (1 + i)^{t-1}$$

$$c_{imp}(t) = c_{imp} \cdot (1 + i)^{t-1}$$

### 7.2 Opust 1:0,6 (depozyt prosumencki)

Zgodnie z art. 38c Ustawy o OZE (Dz.U. 2015 poz. 478 z późn. zm.),
za każde 1 kWh wprowadzone przez spółdzielnię do sieci jej członkowie
mogą odebrać $\eta = 0,6$ kWh bez opłat za energię i zmiennych
opłat dystrybucyjnych:

$$E_{opust\_dost}(t) = \eta \cdot E_{exp}(t)$$

Opust pokrywa rezydualne zapotrzebowanie do wysokości faktycznego
zużycia (nie da się odebrać więcej niż się potrzebuje):

$$E_{opust}(t) = \min\!\left(E_{opust\_dost}(t),\; D - E_{auto}(t)\right)$$

### 7.3 Pozycje przepływu pieniężnego

Dla każdego roku eksploatacji $t$ (gdzie $t \geq 1$):

| Pozycja | Formuła |
|---------|---------|
| Produkcja | $E_{gen}(t-1)$ (rok 1 = 0 lat degradacji) |
| Autokonsumpcja | $E_{auto}(t)$, capped przez zapotrzebowanie $D$ |
| Eksport | $E_{exp}(t) = E_{gen}(t) - E_{auto}(t)$ |
| Oszczędności | $E_{auto}(t) \cdot c_{base}(t)$ |
| Przychód z opustu | $E_{opust}(t) \cdot c_{base}(t)$ |
| Narzut prosumencki | $E_{res}(t) \cdot \bigl(c_{imp}(t) - c_{base}(t)\bigr)$ |
| OPEX | $OPEX(t-1)$ (suma składników z eskalacją + rezerwa inwertera) |
| Rata kredytu | $R$ dla $t \leq n_{kredyt}$, $0$ dla $t > n_{kredyt}$ |
| **Przepływ netto** | Oszczędności + Przychód z opustu − Narzut prosumencki − OPEX − Rata kredytu |
| **Skumulowany przepływ** | $\sum_{k=0}^{t} CF_k$ |

Kluczowa intuicja: oszczędności i opust są wyceniane po cenie **bazowej**
(unikamy zakupu po cenie taryfowej dla odbiorcy bez PV). Narzut prosumencki
obciąża wyłącznie rezydualny import z sieci — czyli tę część zużycia,
której nie pokryły ani PV, ani opust. Wyższa autokonsumpcja zmniejsza
$E_{res}$, a więc zmniejsza karę narzutu — to mechanizm dający
naturalne diminishing returns na krzywych PBP/NPV.

---

## 8. Wskaźniki efektywności ekonomicznej

### 8.1 LCOE — Znormalizowany Koszt Energii

$$LCOE = \frac{\displaystyle CAPEX_{netto} + \sum_{t=1}^{n} \frac{OPEX(t)}{(1+r)^t}}{\displaystyle \sum_{t=1}^{n} \frac{E_{gen}(t)}{(1+r)^t}}$$

Gdzie $OPEX(t)$ zawiera roczną rezerwę na wymianę inwertera (sekcja 5.2),
więc cały koszt wymiany jest naturalnie uwzględniony w liczniku.

Wynik wyrażony w PLN/kWh. Wartość powinna być istotnie niższa niż cena
zakupu energii z sieci, co potwierdza konkurencyjność kosztową instalacji.

**Wariant z finansowaniem kredytowym.** Gdy kredyt jest aktywny, w liczniku
uwzględnia się wkład własny oraz zdyskontowane koszty operacyjne i raty:

$$LCOE_{kredyt} = \frac{\displaystyle W_0 + \sum_{t=1}^{n} \frac{OPEX(t) + R(t)}{(1+r)^t}}{\displaystyle \sum_{t=1}^{n} \frac{E_{gen}(t)}{(1+r)^t}}$$

| Symbol | Znaczenie |
|--------|-----------|
| $W_0$ | Wkład własny właściciela (CAPEX netto minus kwota kredytu) |
| $R(t)$ | Rata kredytu w roku $t$ (zero po upływie okresu kredytowania) |

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

## 9. Analiza wrażliwości

Model oferuje dwa typy analizy wrażliwości, wykonywane po stronie klienta
na wynikach głównej symulacji.

### 9.1 Wrażliwość na autokonsumpcję

Przebiega zakres współczynnika autokonsumpcji od 10% do 90% (co 5 pp.)
i dla każdego punktu przelicza pełen harmonogram cash flow oraz
wskaźniki KPI (NPV, IRR, PBP, LCOE). Pozwala ocenić, jak silnie
opłacalność zależy od udziału energii zużywanej na miejscu.

Efekt diminishing returns przy wysokiej autokonsumpcji wynika naturalnie
z modelu — dalsze zwiększanie AC zmniejsza narzut prosumencki coraz wolniej,
a OPEX i raty kredytu pozostają stałe.

### 9.2 Wrażliwość na scenariusze cenowe

Trzy scenariusze cenowe modyfikują ceny energii i stopę inflacji:

| Scenariusz | Mnożnik cen | Mnożnik inflacji |
|------------|-------------|------------------|
| Pesymistyczny | 0,85× | 0,5× |
| Bazowy | 1,0× | 1,0× |
| Optymistyczny | 1,15× | 1,5× |

Dla każdego scenariusza wykonywana jest pełna analiza wrażliwości
na autokonsumpcję (sekcja 9.1), co daje rodzinę krzywych NPV/PBP
pokazujących wpływ wahań rynku energii na opłacalność.

---

## 10. Stałe modelu

Wartości domyślne oparte o polski rynek energetyki odnawialnej (2025/2026):

| Parametr | Wartość | Opis |
|----------|---------|------|
| Horyzont inwestycji | 25 | Okres życia projektu (lata) |
| Stopa dyskontowa | 0,06 | WACC przyjęty do dyskontowania przepływów |
| Progi kosztowe CAPEX | 4 000 / 3 500 / 3 200 / 2 800 | PLN/kWp wg skali instalacji (>100 kWp = 2 800) |
| Koszt magazynu energii | 2 000 | PLN/kWh pojemności |
| Serwisowanie / czyszczenie | 40 PLN/kWp/rok | Przeglądy i czyszczenie paneli |
| Ubezpieczenie | 0,004 | 0,4% CAPEX brutto rocznie |
| Naprawy | 0,002 | 0,2% CAPEX brutto rocznie |
| Monitoring | 600 PLN/rok | Stała kwota — platforma monitoringu |
| Eskalacja kosztów utrzymania | 0,02 | Roczny wzrost kosztów operacyjnych |
| Koszt wymiany inwertera | 500 PLN/kWp | Wymiana po ok. 12 latach (amortyzowana sinking fund) |
| Współczynnik opustu | 0,6 | $\eta$ z art. 38c Ustawy o OZE — depozyt prosumencki 1:0,6 |
| Bazowa autokonsumpcja | 0,30 / 0,40 / 0,50 | Współczynnik wg rozmiaru gminy (mała/średnia/duża) |
| Przyrost autokonsumpcji z magazynu | 0,20 | pp na każdy kWh/kWp pojemności względnej |
| Górny limit autokonsumpcji | 0,90 | Maksymalny osiągalny współczynnik |

---

## 11. Przebieg obliczeń

Symulacja realizowana jest w następujących krokach:

1. Wyznaczenie współczynnika autokonsumpcji na podstawie rozmiaru gminy,
   pojemności magazynu energii i stosunku zapotrzebowania do produkcji
2. Kalkulacja nakładów inwestycyjnych (progi kosztowe + magazyn)
   z uwzględnieniem dotacji
3. Obliczenie parametrów kredytu (kwota, rata annuitetowa) — jeśli
   finansowanie kredytowe jest aktywne
4. Budowa harmonogramu przepływów pieniężnych na 25 lat z uwzględnieniem:
   inflacji cen energii (cena bazowa + cena prosumencka), degradacji paneli,
   capowania autokonsumpcji przez zapotrzebowanie gminy, opustu 1:0,6,
   narzutu prosumenckiego na rezydualnym imporcie, kosztów utrzymania
   z eskalacją, rocznej rezerwy na wymianę inwertera oraz rat kredytu
5. Obliczenie wskaźników efektywności ekonomicznej: LCOE, NPV, IRR, PBP
6. Wygenerowanie rozkładu produkcji miesięcznej dla pierwszego roku
   eksploatacji
7. Opcjonalnie: analiza wrażliwości na autokonsumpcję i scenariusze cenowe

Wynik obliczeń obejmuje pełną tabelę przepływów pieniężnych rok po roku,
rozkład produkcji miesięcznej oraz zestaw wskaźników umożliwiających
ocenę opłacalności inwestycji.

---

## 12. Ograniczenia i uproszczenia

- **Brak symulacji godzinowej** — autokonsumpcja i wykorzystanie opustu
  modelowane są agregatami rocznymi zamiast porównania profili produkcji
  i zużycia godzina po godzinie.
- **Stały narzut prosumencki** — różnica $c_{imp} - c_{base}$ rośnie
  proporcjonalnie do inflacji, nie modelujemy zmian regulacyjnych
  (np. wprowadzenia/zniesienia narzutu na taryfie prosumenckiej).
- **Symetryczna inflacja cen** — ta sama stopa $i$ stosowana zarówno
  do ceny bazowej jak i prosumenckiej.
- **Stałe roczne zapotrzebowanie** — $D$ nie zmienia się w czasie
  (w rzeczywistości może rosnąć z elektryfikacją lub spadać dzięki
  efektywności energetycznej).
- **Stały współczynnik autokonsumpcji** — nie zmienia się w ciągu życia
  projektu (w rzeczywistości profil zużycia gminy może ewoluować).
- **CAPEX jednorazowy** — cały nakład w roku 0, brak etapowania inwestycji.
- **Uproszczony model kredytu** — annuitet o stałej stopie procentowej,
  bez uwzględnienia zmiennego oprocentowania, prowizji bankowych,
  kosztów zabezpieczeń ani opłat dodatkowych.
- **Sinking fund nominalny** — roczna rezerwa na wymianę inwertera nie
  uwzględnia inflacji ceny inwerterów ani odsetek z odłożonych środków
  (wartości netują się przy typowych założeniach makroekonomicznych).

---

## Źródła danych i kontekst prawny

### Koszty inwestycji (CAPEX PV)
- **IEO** — coroczny raport „Rynek Fotowoltaiki w Polsce", średnie ceny za 1 kWp wg skali.
- **Globenergia** — bieżące zestawienia kosztów komponentów i robocizny.
- **BIP / przetargi** — publiczne przetargi „OZE w gminie X" dają realne ceny rynkowe samorządów.

### Profil zużycia gminy
- **GUS (Bank Danych Lokalnych)** — zużycie energii na 1 mieszkańca w gminie/powiecie.
- **KAPE** — typowe profile zużycia budynków użyteczności publicznej.
- **Plany Gospodarki Niskoemisyjnej (PGN)** — publiczne audyty energetyczne gmin z dokładnymi danymi.

### Nasłonecznienie
- **PVGIS v5.2** (`re.jrc.ec.europa.eu`) — API UE, dane TMY (Typical Meteorological Year),
  godzinowe i miesięczne. Używany endpoint `PVcalc`.

### Ceny energii
- **URE (Urząd Regulacji Energetyki)** — taryfy zatwierdzone (G11, C11, C12) i ceny obrotu.
- **TGE (Towarowa Giełda Energii)** — ceny hurtowe RDN.
- **Faktury własne / przetargi gminne** — realny narzut prosumencki dla konkretnych OSD.

### Kontekst prawny
- Spółdzielnie energetyczne korzystają z systemu **depozytu prosumenckiego (opust 1:0,6)**
  — art. 38c Ustawy o OZE (Dz.U. 2015 poz. 478 z późn. zm.).
- **Narzut prosumencki w taryfach** — sprzedawcy stosują wyższe ceny zakupu energii
  dla odbiorców z własnym źródłem. Model różnicuje cenę bazową i cenę importu.
- **Dofinansowania:** NFOŚiGW „Energia dla Wsi", KPO (do 80–90% na etap przedinwestycyjny).
