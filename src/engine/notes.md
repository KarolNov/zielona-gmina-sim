# Notatki robocze — źródła danych i kontekst prawny

> Plik tymczasowy. Docelowa dokumentacja modelu: `model.md`.

## Źródła danych

### Koszty inwestycji (CAPEX PV)
- **IEO** — coroczny raport „Rynek Fotowoltaiki w Polsce", średnie ceny za 1 kWp wg skali.
- **Globenergia** — bieżące zestawienia kosztów komponentów i robocizny.
- **BIP / przetargi** — publiczne przetargi „OZE w gminie X" dają realne ceny rynkowe samorządów.

### Profil zużycia gminy
- **GUS (Bank Danych Lokalnych)** — zużycie energii na 1 mieszkańca w gminie/powiecie.
- **KAPE** — typowe profile zużycia budynków użyteczności publicznej.
- **Plany Gospodarki Niskoemisyjnej (PGN)** — publiczne audyty energetyczne gmin z dokładnymi danymi.

### Nasłonecznienie
- **PVGIS v5.2** (`re.jrc.ec.europa.eu`) — API UE, dane TMY (Typical Meteorological Year), godzinowe i miesięczne. Używamy endpointu `PVcalc`.
- **Global Solar Atlas** — wizualizacja potencjału lokalizacji.

## Kontekst prawny (PL)

- Spółdzielnie energetyczne korzystają z systemu depozytu prosumenckiego.
- **Dofinansowania:** NFOŚiGW „Energia dla Wsi", KPO (do 80–90% na etap przedinwestycyjny).
- **Ulgi:** zwolnienie z opłaty OZE, opłaty kogeneracyjnej i części opłat dystrybucyjnych zmiennych.

## Potencjalne rozszerzenia (TODO)

- Symulacja godzinowa (profil produkcji vs. profil zużycia) zamiast stałego współczynnika autokonsumpcji.
- Asymetryczna inflacja (osobna stopa dla ceny zakupu i sprzedaży).
- Etapowanie CAPEX (rozłożenie inwestycji na kilka lat).
- Wymiana inwertera po ~12 latach jako dodatkowy CAPEX.
