## Plan: PV ROI Simulator — etap początkowy

Cel: przygotować projekt interfejsu i podstawowe wejścia dla symulatora zwrotu inwestycji w instalacje fotowoltaiczne dla polskich gmin. Ten dokument opisuje proponowaną strukturę UI, model danych, trasę startową i priorytetowe zadania implementacyjne. Interfejs ma być w języku polskim.

Założenia (domyślne, można zmienić):
- Klasyfikacja wielkości gminy według liczby mieszkańców: mała < 10 000; średnia 10 000–50 000; duża > 50 000. (Jeśli chcesz inne progi, podaj je.)
- Wersja startowa trzyma dane lokalnie w stanie aplikacji (np. React context / prosty store). Później można dodać persistencję (localStorage / backend).

Krótka umowa (contract)
- Wejścia: rozmiar gminy (kategoria), procent dofinansowania (donation %), moc instalacji PV (kW), liczba dni słonecznych w roku (dni/rok).
- Wyjścia (początkowe): przechowywany stan tych wejść, prosty podgląd wartości w UI, walidacja i dostęp do danych dla dalszych obliczeń ROI.
- Tryby błędów: puste pola, wartości poza rozsądnym zakresem — pokaż walidację po polsku.

Główne wymagania użytkownika (zmapowane)
- Zmiana motywu na zielono-biały (Done: plan + paleta i zmienne CSS opisane)
- Dodanie podstawowej trasy (home) (Done: plan opisuje trasę i pliki)
- Przechowywanie danych: rozmiar gminy, donation %, moc PV, liczba dni słonecznych (Done: model danych i store opisane)
- UI controls w języku polskim (Done: szczegóły kontrolek i etykiety)

Model danych (TypeScript — propozycja)

interface CommuneInputs {
  communeSize: 'mala' | 'srednia' | 'duza';
  donationPct: number; // 0-100
  pvPowerKw: number; // np. 0-500
  sunnyDaysPerYear: number; // 0-365
}

Store/State:
- W prostej wersji: React context + useReducer lub tanstack demo-store (tu użyć istniejącego `lib/demo-store.ts` jako inspiracji).
- API store: getState(), setField(field, value), reset(), validate()

UI — elementy i etykiety (Polski)
- Nagłówek: "Symulator ROI fotowoltaiki — Gmina"
- Podtytuł: krótkie info i link do "O projekcie"
- Kontrolki wejściowe (formularz):
  - Rozmiar gminy (radio) — etykiety: "Mała ( < 10 000)", "Średnia (10 000–50 000)", "Duża ( > 50 000)"
  - Procent dofinansowania (donation %) — suwak + input liczbowy — etykieta: "Dofinansowanie (%)"
  - Moc instalacji PV (kW) — input liczbowy — etykieta: "Moc instalacji (kW)"
  - Liczba dni słonecznych/rok — input liczbowy lub suwak — etykieta: "Dni słoneczne w roku"
  - Przycisk: "Zapisz" / "Zastosuj" (aktualizuje store)

Interaktywne elementy i walidacja:
- Suwaki pokazują aktualną wartość na żywo.
- Walidacja po polsku: np. "Procent dofinansowania musi być pomiędzy 0 a 100".
- Dla pustych pól — domyślne wartości: mała, donation 0, pvPower 10, sunnyDays 180.

Kolorystyka i motyw (motyw startowy — zielono-biały)
- Główna paleta:
  - --color-bg: #ffffff (biały)
  - --color-surface: #f6fff6 (bardzo jasna zieleń)
  - --color-primary: #1f8a3d (zielony)
  - --color-primary-600: #166f31
  - --color-accent: #9ddf7a (jasna zieleń)
  - --color-text: #0b2b13 (ciemna zieleń / niemal czarny)
  - --color-muted: #4b5b49
- Propozycja implementacji: dodać zmienne CSS w `src/styles.css` lub utworzyć plik `src/theme.css` i podłączyć zmienne do istniejącego layoutu. Upewnić się, że kontrast spełnia WCAG (np. tekst na białym tle ma wystarczający kontrast).

Trasy i pliki początkowe
- Trasa startowa: `/` (home). Plik: `src/routes/index.tsx` (już istnieje) — edytować, aby renderował formularz i podgląd stanu.
- Dodatkowa trasa informacyjna: `/about` (już istnieje `about.tsx`).

Komponenty (priorytet)
1. `ThemeProvider` / proste zmienne CSS — w `src/styles.css` lub `src/theme.css`.
2. `CommuneForm` — formularz wejściowy z kontrolkami (w `src/components/CommuneForm.tsx`).
3. `CommunePreview` — mały panel pokazujący aktualne wartości (w `src/components/CommunePreview.tsx`).
4. Store/Provider — `src/lib/commune-store.tsx` lub integracja z `lib/demo-store.ts`.

Przykładowe etykiety i teksty UI (Polski)
- "Rozmiar gminy"
- "Dofinansowanie (%)"
- "Moc instalacji (kW)"
- "Dni słoneczne w roku"
- Przycisk: "Zastosuj"
- Komunikaty walidacji: "Wartość musi być liczbą dodatnią", "Wartość musi być między X i Y".

Edge cases do przemyślenia
- Nierealistyczne wartości (np. PV > 1000 kW) — ograniczyć zakres i pokazać hint.
- Brak danych — użyć domyślnych i wyraźnej informacji, że wartości są przybliżone.
- Różne jednostki (kWp vs kW) — na start zakładamy kW i jasno to opisujemy.

Testy i walidacja
- Jednostkowe (opt.): testy reducer/store (np. Vitest) — sprawdzić operacje setField/reset/validate.
- E2E (opt.): proste Cypress / Playwright scenariusze: render strony, wypełnij formularz, kliknij "Zastosuj", sprawdź store.

Priorytetowe kroki implementacji (sprint 1)
1. Dodać `plan.md` (ten plik).
2. Dodać zmienne motywu w `src/styles.css` i zastosować podstawowy kolor w `Header` i przyciskach.
3. Utworzyć `src/lib/commune-store.tsx` (React context + reducer) z definicją `CommuneInputs` i prostymi akcjami.
4. Dodać komponent `CommuneForm` i umieścić go na `/` (edytuj `src/routes/index.tsx` aby renderować formularz i preview).
5. Dodać prostą walidację i domyślne wartości.

Pliki do edycji (sugerowane)
- `src/styles.css` — dodać zmienne tematyczne
- `src/components/Header.tsx` — zastosować kolor primarny
- `src/lib/commune-store.tsx` — nowy store
- `src/components/CommuneForm.tsx` — nowy
- `src/components/CommunePreview.tsx` — nowy
- `src/routes/index.tsx` — podłączyć formę

Weryfikacja (smoke test)
1. Uruchomić aplikację (npm run dev / pnpm / etc.)
2. Otworzyć `/` — zobaczyć formularz, napisy po polsku i zielony motyw w nagłówku/przyciskach.
3. Wypełnić pola i kliknąć "Zastosuj" — sprawdzić, że wartości zapisują się w store i wyświetlają w `CommunePreview`.

Następne kroki po wdrożeniu sprintu 1
- Dodać obliczenia ROI (energetyczne/finansowe) i wykresy (np. recharts lub chart.js).
- Dodać persistent storage (localStorage) i opcję eksportu/importu konfiguracji.
- Rozszerzyć język (i18n) jeśli będziemy dodawać angielski.

Contact / uwagi
- Jeśli chcesz, mogę od razu zaimplementować kroki 2–4 (zmienne motywu, store, formularz, home) i uruchomić lokalny smoke test. Podaj proszę preferencje progu klas rozmiaru gminy jeśli mają być inne niż podane.

---
Data: 2026-03-07
