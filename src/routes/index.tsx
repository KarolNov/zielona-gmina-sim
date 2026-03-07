import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(157,223,122,0.18),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(31,138,61,0.12),transparent_66%)]" />
        <p className="island-kicker mb-3">Symulator PV — Gmina</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Symulator zwrotu inwestycji w instalacje fotowoltaiczne
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Wprowadź parametry gminy i instalacji, aby oszacować zwrot z inwestycji.
        </p>
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Akcje</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>Wprowadź rozmiar gminy, procent dofinansowania, moc PV i dni słoneczne.</li>
          <li>Kliknij "Zastosuj" aby zapisać konfigurację (lokalnie).</li>
          <li>Później: wykresy, obliczenia ROI i eksport konfiguracji.</li>
        </ul>
      </section>
    </main>
  )
}
