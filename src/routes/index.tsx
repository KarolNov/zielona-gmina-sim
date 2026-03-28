import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, X } from "lucide-react";
import {
	type ComponentType,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
// SolarMap uses Leaflet which references `window`. To avoid SSR errors we
// dynamically import the component on the client only (see below).
import { fetchSolarSummary } from "#/lib/fetch";
import { num, type SearchParams, searchDefaults } from "#/lib/search-params";
import { CommuneType } from "#/lib/types";
import { cenaEnergiiSchema } from "#/lib/validators/cena-energii";
import { cenaSprzedazySchema } from "#/lib/validators/cena-sprzedazy";
import { degradacjaSchema } from "#/lib/validators/degradacja";
import { donationSchema } from "#/lib/validators/donation";
import { inflacjaSchema } from "#/lib/validators/inflacja";
import { getPvPowerSchema } from "#/lib/validators/pv-power";
import { valibotValidator } from "#/lib/validators/valibot";
import LatLonInput from "../components/inputs/LatLonInput";
import NumberInput from "../components/inputs/NumberInput";
import Select from "../components/inputs/Select";
import Toggle from "../components/inputs/Toggle";

export const Route = createFileRoute("/")({
	component: App,
	validateSearch: (raw: Record<string, unknown>): SearchParams => ({
		communeSize: Object.values(CommuneType).includes(
			raw.communeSize as CommuneType,
		)
			? (raw.communeSize as CommuneType)
			: searchDefaults.communeSize,
		donation: num(raw.donation, searchDefaults.donation),
		pvPower: num(raw.pvPower, searchDefaults.pvPower),
		storageEnabled:
			raw.storageEnabled === true || raw.storageEnabled === "true",
		storagePct: num(raw.storagePct, searchDefaults.storagePct),
		degradacja: num(raw.degradacja, searchDefaults.degradacja),
		katNachylenia: num(raw.katNachylenia, searchDefaults.katNachylenia),
		cenaEnergii: num(raw.cenaEnergii, searchDefaults.cenaEnergii),
		cenaSprzedazy: num(raw.cenaSprzedazy, searchDefaults.cenaSprzedazy),
		inflacjaEnergii: num(raw.inflacjaEnergii, searchDefaults.inflacjaEnergii),
		lat: num(raw.lat, searchDefaults.lat),
		lon: num(raw.lon, searchDefaults.lon),
	}),
});

function App() {
	const getSolarSummary = useServerFn(fetchSolarSummary);
	const search = Route.useSearch();
	const router = useRouter();

	const setParam = useCallback(
		<K extends keyof SearchParams>(key: K, value: SearchParams[K]) => {
			router.navigate({
				to: "/",
				search: (prev) => ({ ...searchDefaults, ...prev, [key]: value }),
				replace: true,
				resetScroll: false,
			});
		},
		[router],
	);

	const {
		communeSize,
		donation,
		pvPower,
		storageEnabled,
		storagePct,
		degradacja,
		katNachylenia,
		cenaEnergii,
		cenaSprzedazy,
		inflacjaEnergii,
		lat,
		lon,
	} = search;

	// Estimated storage capacity in kWh derived from PV power and percent
	const storageCapacity = Math.round(((pvPower * storagePct) / 100) * 10) / 10;
	const mapDialogRef = useRef<HTMLDialogElement>(null);
	const [mapDialogOpen, setMapDialogOpen] = useState(false);
	type SolarMapProps = {
		onLocationSelect: (lat: number, lng: number) => void;
		centerLat: number;
		centerLon: number;
	};
	const [SolarMapComponent, setSolarMapComponent] =
		useState<ComponentType<SolarMapProps> | null>(null);

	useEffect(() => {
		let mounted = true;

		// Import on client only to avoid SSR failures from Leaflet's `window` usage
		import("#/components/map/map").then((mod) => {
			if (!mounted) return;
			// Use default export if available
			const Comp = mod?.default ?? mod;
			setSolarMapComponent(() => Comp as ComponentType<SolarMapProps>);
		});

		return () => {
			mounted = false;
		};
	}, []);

	const { data: solarData } = useQuery({
		queryKey: ["solar", lat, lon, pvPower, katNachylenia],
		queryFn: () => {
			return getSolarSummary({
				data: { lat, lon, pvPower, angle: katNachylenia },
			});
		},
		placeholderData: keepPreviousData,
		staleTime: 60 * 60 * 1000, // 60 minut
	});

	// Suppress unused variable warning — solarData will be used in charts later
	void solarData;

	const openMap = () => {
		mapDialogRef.current?.showModal();
		setMapDialogOpen(true);
	};

	const closeMap = () => {
		mapDialogRef.current?.close();
		setMapDialogOpen(false);
	};

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="island-shell rise-in relative overflow-hidden rounded-4xl px-6 py-10 sm:px-10 sm:py-14">
				<div
					className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full"
					style={{
						background:
							"radial-gradient(circle, rgba(157,223,122,0.18), transparent 66%)",
					}}
				/>

				<div
					className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full"
					style={{
						background:
							"radial-gradient(circle, rgba(31,138,61,0.12), transparent 66%)",
					}}
				/>

				<p className="island-kicker mb-3">Symulator PV — Gmina</p>
				<h1 className="display-title mb-5 max-w-3xl text-4xl leading-tight font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
					Symulator zwrotu inwestycji w spółdzielnie fotowoltaiczną
				</h1>

				<p className="mb-8 max-w-2xl text-base text-(--sea-ink-soft) sm:text-lg">
					Wprowadź parametry gminy i instalacji. Profile nasłonecznienia są
					pobierane automatycznie po aktualizacji danych.
				</p>

				<details className="group mt-6 rounded-xl border border-(--chip-line) bg-(--chip-bg)">
					<summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-(--sea-ink) list-none flex items-center justify-between">
						Parametry gminy
						<span className="text-(--lagoon-deep) text-xs group-open:rotate-180 transition-transform">
							▾
						</span>
					</summary>
					<div className="flex flex-col gap-4 px-4 pb-4 pt-2">
						<Select
							id="communeSize"
							label="Rozmiar gminy"
							value={communeSize}
							onChange={(v) => setParam("communeSize", v)}
							options={[
								{ value: CommuneType.SMALL, label: "Mała (< 10 000)" },
								{ value: CommuneType.MEDIUM, label: "Średnia (10 000–50 000)" },
								{ value: CommuneType.LARGE, label: "Duża (> 50 000)" },
							]}
						/>
						<div>
							<button
								type="button"
								onClick={openMap}
								className="flex w-full items-center gap-3 rounded-xl border border-(--chip-line) bg-(--chip-bg) px-4 py-3 text-left transition hover:border-(--lagoon-deep) hover:bg-(--foam) cursor-pointer"
							>
								<MapPin className="h-5 w-5 shrink-0 text-(--lagoon-deep)" />
								<div>
									<div className="text-sm font-semibold text-(--sea-ink)">
										Lokalizacja
									</div>
									<div className="text-xs text-(--sea-ink-soft)">
										{lat.toFixed(4)}°N, {lon.toFixed(4)}°E — kliknij aby zmienić
									</div>
								</div>
							</button>
						</div>
						<details className="group rounded-xl border border-(--chip-line) bg-(--chip-bg)">
							<summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-(--sea-ink) list-none flex items-center justify-between">
								Współrzędne (ręczne)
								<span className="text-(--lagoon-deep) text-xs group-open:rotate-180 transition-transform">
									▾
								</span>
							</summary>
							<div className="px-4 pb-4 pt-1">
								<LatLonInput
									lat={lat}
									lon={lon}
									onLatChange={(v) => setParam("lat", v)}
									onLonChange={(v) => setParam("lon", v)}
								/>
							</div>
						</details>
					</div>
				</details>

				<details className="group mt-3 rounded-xl border border-(--chip-line) bg-(--chip-bg)">
					<summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-(--sea-ink) list-none flex items-center justify-between">
						Parametry techniczne
						<span className="text-(--lagoon-deep) text-xs group-open:rotate-180 transition-transform">
							▾
						</span>
					</summary>
					<div className="flex flex-col gap-4 px-4 pb-4 pt-2">
						<NumberInput
							label="Moc instalacji (kWp)"
							value={pvPower}
							onChange={(v) => setParam("pvPower", v)}
							validator={valibotValidator(getPvPowerSchema(communeSize))}
							min={0}
							max={500}
							step={1}
							name="pvPower"
						/>
						<NumberInput
							label="Kąt nachylenia paneli (°)"
							value={katNachylenia}
							onChange={(v) => setParam("katNachylenia", v)}
							min={0}
							max={90}
							step={1}
							decimal={0}
							name="katNachylenia"
							id="katNachylenia"
						/>
						<NumberInput
							label="Degradacja paneli r/r (%)"
							value={degradacja}
							onChange={(v) => setParam("degradacja", v)}
							min={0}
							max={2}
							step={0.1}
							decimal={1}
							validator={valibotValidator(degradacjaSchema)}
							name="degradacja"
							id="degradacja"
						/>
						<Toggle
							label="Użyć magazynu energii"
							checked={storageEnabled}
							onChange={(v) => setParam("storageEnabled", v)}
							name="storageEnabled"
						/>
						{storageEnabled ? (
							<>
								<NumberInput
									label="% pojemności magazynu względem mocy PV"
									value={storagePct}
									onChange={(v) => setParam("storagePct", v)}
									min={0}
									max={100}
									step={1}
									decimal={0}
									name="storagePct"
									id="storagePct"
								/>
								<div className="text-sm text-(--sea-ink-soft)">
									Szacowana pojemność: {storageCapacity} kWh
								</div>
							</>
						) : null}
					</div>
				</details>

				<details className="group mt-3 rounded-xl border border-(--chip-line) bg-(--chip-bg)">
					<summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-(--sea-ink) list-none flex items-center justify-between">
						Parametry rynkowe
						<span className="text-(--lagoon-deep) text-xs group-open:rotate-180 transition-transform">
							▾
						</span>
					</summary>
					<div className="flex flex-col gap-4 px-4 pb-4 pt-2">
						<NumberInput
							label="Dofinansowanie (%)"
							value={donation}
							onChange={(v) => setParam("donation", v)}
							min={0}
							max={100}
							step={1}
							decimal={2}
							validator={valibotValidator(donationSchema)}
							name="donationPct"
							id="donationPct"
						/>
						<NumberInput
							label="Cena energii z sieci (PLN/kWh)"
							value={cenaEnergii}
							onChange={(v) => setParam("cenaEnergii", v)}
							min={0.1}
							max={3}
							step={0.01}
							decimal={2}
							validator={valibotValidator(cenaEnergiiSchema)}
							name="cenaEnergii"
							id="cenaEnergii"
						/>
						<NumberInput
							label="Cena sprzedaży nadwyżek (PLN/kWh)"
							value={cenaSprzedazy}
							onChange={(v) => setParam("cenaSprzedazy", v)}
							min={0}
							max={3}
							step={0.01}
							decimal={2}
							validator={valibotValidator(cenaSprzedazySchema)}
							name="cenaSprzedazy"
							id="cenaSprzedazy"
						/>
						<NumberInput
							label="Inflacja ceny energii (%/rok)"
							value={inflacjaEnergii}
							onChange={(v) => setParam("inflacjaEnergii", v)}
							min={0}
							max={15}
							step={0.5}
							decimal={1}
							validator={valibotValidator(inflacjaSchema)}
							name="inflacjaEnergii"
							id="inflacjaEnergii"
						/>
					</div>
				</details>
			</section>

			{/* Map modal — rendered outside <section> so dialog backdrop covers full page */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: dialog handles Escape natively */}
			<dialog
				ref={mapDialogRef}
				className="island-shell m-auto w-full max-w-2xl rounded-2xl p-4 backdrop:bg-black/50"
				onClick={(e) => {
					if (e.target === e.currentTarget) closeMap();
				}}
				onClose={() => setMapDialogOpen(false)}
			>
				<div className="mb-3 flex items-center justify-between">
					<span className="text-sm font-semibold text-(--sea-ink)">
						Wybierz lokalizację
					</span>
					<button
						type="button"
						onClick={closeMap}
						className="rounded-lg p-1 text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors cursor-pointer"
						aria-label="Zamknij"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				{/* Mount map only when dialog is open — Leaflet needs a visible container
				    to correctly calculate tile bounds and map size */}
				{mapDialogOpen && SolarMapComponent ? (
					<SolarMapComponent
						centerLat={lat}
						centerLon={lon}
						onLocationSelect={(newLat, lng) => {
							router.navigate({
								to: "/",
								search: (prev) => ({
									...searchDefaults,
									...prev,
									lat: newLat,
									lon: lng,
								}),
								replace: true,
								resetScroll: false,
							});
							closeMap();
						}}
					/>
				) : (
					<div className="h-100 w-full rounded-lg bg-gray-200 flex items-center justify-center text-sm text-gray-500">
						Ładowanie mapy…
					</div>
				)}
			</dialog>

			<section className="island-shell mt-8 rounded-2xl p-6">
				<p className="island-kicker mb-2">Jak korzystać?</p>
				<ul className="m-0 list-disc space-y-2 pl-5 text-sm text-(--sea-ink-soft)">
					<li>
						Wprowadź lokalizację i rozmiar gminy, procent dofinansowania, moc
						PV.
					</li>
					<li>Później: wykresy, obliczenia ROI.</li>
				</ul>
			</section>
		</main>
	);
}
