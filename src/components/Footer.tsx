export default function Footer() {
  const year = new Date().getFullYear()

  return (
  <footer className="mt-20 border-t border-(--line) px-4 pb-14 pt-10 text-(--sea-ink-soft)">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} Zielona Gmina PV</p>
        <p className="island-kicker m-0">Spółdzielnia energetyczna — kalkulator</p>
      </div>
      <div className="mt-4 flex justify-center gap-4">
  <a href="https://karolnov.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors">karolnov.dev</a>
      </div>
    </footer>
  )
}
