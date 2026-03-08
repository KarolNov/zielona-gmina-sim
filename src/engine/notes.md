# Struktura Modelu (Logika Obliczeniowa)
Model powinien opierać się na bilansowaniu energii w czasie rzeczywistym (najlepiej w interwałach godzinowych), ponieważ opłacalność spółdzielni zależy od autokonsumpcji zbiorowej.

1. Nakłady inwestycyjne (CAPEX): Koszt instalacji PV, magazynów energii (opcjonalnie), infrastruktury przyłączeniowej i kosztów miękkich (dokumentacja, zawiązanie spółdzielni).

2. Koszty operacyjne (OPEX): Serwis, ubezpieczenie, zarządzanie rozliczeniami wewnątrz spółdzielni, opłaty dystrybucyjne (z uwzględnieniem ulg dla spółdzielni).

Przychody/Oszczędności: Uniknięte koszty zakupu energii z sieci oraz ewentualna sprzedaż nadwyżek (choć model spółdzielni promuje zużywanie energii przez członków).

## Źródła danych – Gdzie szukać konkretów?
Aby model był wiarygodny dla polskiej gminy wiejskiej, potrzebujesz danych zakotwiczonych w naszej rzeczywistości:

#### Koszty inwestycji (PV)
Raporty IEO (Instytut Energetyki Odnawialnej): Wydają coroczny raport „Rynek Fotowoltaiki w Polsce”, gdzie znajdziesz średnie ceny za 1 kWp dla instalacji różnej skali.

Portale branżowe (np. Globenergia): Publikują aktualne zestawienia kosztów komponentów i robocizny.

Oferty wykonawców: Przejrzyj publiczne przetargi na „OZE w gminie X” w Biuletynach Informacji Publicznej (BIP) – to kopalnia wiedzy o realnych cenach rynkowych po jakich kupują samorządy.

#### Zapotrzebowanie na energię (Profil Gminy)
To najtrudniejszy element. Gmina wiejska to miks: oświetlenie uliczne, pompy ciepła w szkołach, hydrofornie oraz gospodarstwa domowe.

GUS (Bank Danych Lokalnych): Znajdziesz tam zużycie energii elektrycznej w gospodarstwach domowych na 1 mieszkańca w danej gminie/powiecie.

KAPE (Krajowa Agencja Poszanowania Energii): Udostępniają typowe profile zużycia dla budynków użyteczności publicznej.

Audyty energetyczne: Szukaj w sieci „Planów Gospodarki Niskoemisyjnej” (PGN) dla dowolnej gminy wiejskiej. Są to dokumenty publiczne, które zawierają dokładne dane o zużyciu energii w danej jednostce.

#### Dane o nasłonecznieniu (Uzysk energii)
PVGIS (Photovoltaic Geographical Information System): Darmowe narzędzie UE. Wpisujesz współrzędne gminy i pobierasz dane godzinowe (Typical Meteorological Year) dla Polski. Uwzględnia ono zmienność pogodową i liczbę dni słonecznych.

Global Solar Atlas: Świetne narzędzie do wizualizacji potencjału danej lokalizacji.


## Finansowanie i Uwarunkowania Prawne
Spółdzielnie w Polsce korzystają ze specjalnego systemu rozliczeń (tzw. depozyt prosumencki lub system ilościowy w zależności od aktualnych przepisów dla społeczności energetycznych).

Dofinansowania: Sprawdź programy NFOŚiGW (np. „Energia dla Wsi”) oraz środki z KPO (Krajowy Plan Odbudowy), które przewidują wysokie dotacje na tworzenie społeczności energetycznych (nawet do 80-90% na etap przedinwestycyjny).

Ulgi: Pamiętaj, że spółdzielnie są zwolnione z opłaty OZE, opłaty kogeneracyjnej oraz części opłat dystrybucyjnych zmiennych (to klucz do ich rentowności).

## Kluczowe Wskaźniki (Wyjście modelu)
Twój model finansowy powinien ostatecznie wyliczyć:

LCOE (Levelized Cost of Energy): Jaki jest koszt 1 MWh wyprodukowanej przez spółdzielnię.

NPV (Net Present Value): Czy inwestycja zarobi na siebie w ciągu 20-25 lat.

IRR (Internal Rate of Return): Wewnętrzna stopa zwrotu.

Prosty czas zwrotu (SPBT): Po ilu latach oszczędności pokryją nakłady.

Ważna uwaga: W modelu dla gminy wiejskiej uwzględnij zmienną autokonsumpcji. Im więcej energii zużyjecie "na miejscu" w momencie, gdy świeci słońce (np. praca pomp w wodociągach w dzień), tym model będzie bardziej zielony na wykresach.