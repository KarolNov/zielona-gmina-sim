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

- Spółdzielnie energetyczne korzystają z systemu **depozytu prosumenckiego (opust 1:0,6)**
  — art. 38c Ustawy o OZE (Dz.U. 2015 poz. 478 z późn. zm.). Za każde 1 kWh
  oddane do sieci członkowie spółdzielni odbierają 0,6 kWh bez opłat za
  energię i zmiennych opłat dystrybucyjnych.
- **Narzut prosumencki w taryfach.** Sprzedawcy stosują wyższe ceny
  zakupu energii dla odbiorców z własnym źródłem (taryfa prosumencka,
  opłata jakościowa, narzut handlowy). Model różnicuje cenę bazową
  $c_{base}$ i cenę importu $c_{imp}$ (zwykle +10–20%).
- **Dofinansowania:** NFOŚiGW „Energia dla Wsi", KPO (do 80–90% na etap przedinwestycyjny).
- **Ulgi:** zwolnienie z opłaty OZE, opłaty kogeneracyjnej i części opłat dystrybucyjnych zmiennych.

## Źródła cen energii

- **URE (Urząd Regulacji Energetyki)** — taryfy zatwierdzone (G11, C11, C12) i ceny obrotu.
- **TGE (Towarowa Giełda Energii)** — ceny hurtowe RDN.
- **Faktury własne / przetargi gminne** — realny narzut prosumencki dla konkretnych OSD.

## Potencjalne rozszerzenia (TODO)

- Symulacja godzinowa (profil produkcji vs. profil zużycia) zamiast stałego współczynnika autokonsumpcji.
- Asymetryczna inflacja (osobne stopy dla ceny bazowej i prosumenckiej).
- Etapowanie CAPEX (rozłożenie inwestycji na kilka lat).
- Modelowanie zmian regulacyjnych narzutu prosumenckiego w czasie.
