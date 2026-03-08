## 1. Moduł Założeń (Inputs)

To serce modelu. Tutaj wpisujesz zmienne, które możesz testować (analiza wrażliwości).

| Kategoria | Kluczowe parametry | Jednostka |
| --- | --- | --- |
| **Techniczne** | Moc zainstalowana (np. 500 kWp), sprawność paneli, roczny spadek wydajności (degradacja, ok. 0,5%). | kWp, % |
| **Energetyczne** | Roczny uzysk z 1 kWp (dla Polski przyjmij ok. 1000–1050 kWh), stopień autokonsumpcji zbiorowej (ile energii członkowie zużyją od razu). | kWh, % |
| **Finansowe** | Koszt budowy (CAPEX), koszt eksploatacji (OPEX), stopa dyskontowa (WACC), inflacja. | PLN, % |
| **Rynkowe** | Cena zakupu energii z sieci (taryfa), cena sprzedaży nadwyżek (jeśli dotyczy), wysokość dotacji. | PLN/MWh, % |

---

## 2. Moduł Energetyczny (Energy Balance)

Zanim policzysz pieniądze, musisz policzyć kilowatogodziny.

$$E_{gen}(t) = P_{inst} \cdot Y \cdot (1 - d)^t$$

Gdzie:

* $E_{gen}(t)$: Energia wygenerowana w roku $t$.
* $P_{inst}$: Moc zainstalowana.
* $Y$: Uzysk z 1 kWp (z bazy PVGIS).
* $d$: Roczna degradacja paneli.

Następnie rozdziel $E_{gen}$ na dwie ścieżki:

1. **Autokonsumpcja ($E_{auto}$):** Ta energia zostaje w spółdzielni. Oszczędność = ($E_{auto} \times$ pełna cena zakupu energii z sieci wraz z dystrybucją).
2. **Eksport ($E_{exp}$):** Nadwyżka wysłana do sieci. Przychód = ($E_{exp} \times$ cena rynkowa energii).

---

## 3. Harmonogram Przepływów Pieniężnych (Cash Flow)

Zbuduj tabelę na 15–20 lat (typowy okres życia projektu).

| Rok | 0 (Inwestycja) | 1 | 2 | ... | 20 |
| --- | --- | --- | --- | --- | --- |
| **Nakłady (CAPEX)** | -5 000 000 PLN | 0 | 0 | 0 | 0 |
| **Dotacje (+)** | +3 000 000 PLN | 0 | 0 | 0 | 0 |
| **Oszczędności (+)** | 0 | +400 000 PLN | +410 000 PLN | ... | ... |
| **Koszty OPEX (-)** | 0 | -50 000 PLN | -52 000 PLN | ... | ... |
| **Net Cash Flow** | **-2 000 000 PLN** | **+350 000 PLN** | **+358 000 PLN** | ... | ... |

---

## 4. Wskaźniki Efektywności (KPIs)

Na samym końcu oblicz wskaźniki, które odpowiedzą na pytanie "czy to się opłaca?":

* **NPV (Wartość Bieżąca Netto):** Jeśli $> 0$, projekt jest opłacalny przy danym koszcie kapitału.
* **IRR (Wewnętrzna Stopa Zwrotu):** Powinna być wyższa niż oprocentowanie lokat lub kredytu.
* **LCOE (Zrównoważony Koszt Energii):** 
$$LCOE = \frac{\sum_{t=0}^{n} \frac{CAPEX_t + OPEX_t}{(1+r)^t}}{\sum_{t=0}^{n} \frac{E_{gen,t}}{(1+r)^t}}$$



To pokaże Ci realny koszt 1 MWh ze spółdzielni (powinien być znacznie niższy niż rynkowy).

---

## Gdzie jest "haczyk"? (Zmienna krytyczna)

Dla typowej gminy wiejskiej kluczowa jest **krzywa popytu**. Gmina zużywa najwięcej energii rano i wieczorem (oświetlenie), a PV produkuje w południe.

> **Mój tip:** W modelu uwzględnij scenariusz z magazynem energii. Zwiększy on CAPEX, ale drastycznie podniesie autokonsumpcję, co przy obecnych cenach energii i dotacjach z programu "Energia dla Wsi" często skraca czas zwrotu zamiast go wydłużać.

Czy chcesz, abym pomógł Ci teraz dobrać konkretne wartości (ceny za 1 kWp czy taryfy), które obecnie panują na polskim rynku, abyś mógł zacząć wpisywać dane?