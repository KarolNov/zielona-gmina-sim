import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SolarSeasonalChart } from "#/components/charts/solar-averages-chart";
import SolarMap from "#/components/map/map";
import { fetchSolarSummary } from "#/lib/fetch";
import { CommuneType } from "#/lib/types";
import { donationSchema } from "#/lib/validators/donation";
import { getPvPowerSchema } from "#/lib/validators/pv-power";
import { valibotValidator } from "#/lib/validators/valibot";
import LatLonInput from "../components/inputs/LatLonInput";
import NumberInput from "../components/inputs/NumberInput";
import Select from "../components/inputs/Select";
import Toggle from "../components/inputs/Toggle";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const getSolarSummary = useServerFn(fetchSolarSummary);
	const [communeSize, setCommuneSize] = useState<CommuneType>(
		CommuneType.SMALL,
	);
	const [donation, setDonation] = useState<number>(0);
	const [pvPower, setPvPower] = useState<number>(10);
	const [storageEnabled, setStorageEnabled] = useState<boolean>(false);
	const [lat, setLat] = useState<number>(52.2297);
	const [lon, setLon] = useState<number>(21.0122);

	const {
		data: solarData,
		isFetching: solarLoading,
		error: solarError,
		// refetch: refetchSolar,
	} = useQuery({
		queryKey: ["solar", lat, lon, pvPower],
		queryFn: () => {
			return getSolarSummary({ data: { lat, lon, pvPower } });
		},
		placeholderData: keepPreviousData,
		staleTime: 60 * 60 * 1000, // 60 minut
	});

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

				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<SolarMap
						onLocationSelect={(lat, lng) => {
              console.log("Location selected:", { lat, lng });
							setLat(lat);
							setLon(lng);
						}}
					/>
					<LatLonInput
						lat={lat}
						lon={lon}
						onLatChange={setLat}
						onLonChange={setLon}
					/>

					<Select
						id="communeSize"
						label="Rozmiar gminy"
						value={communeSize}
						onChange={setCommuneSize}
						options={[
							{ value: CommuneType.SMALL, label: "Mała (< 10 000)" },
							{ value: CommuneType.MEDIUM, label: "Średnia (10 000–50 000)" },
							{ value: CommuneType.LARGE, label: "Duża (> 50 000)" },
						]}
					/>

					<NumberInput
						label="Dofinansowanie (%)"
						value={donation}
						onChange={setDonation}
						min={0}
						max={100}
						step={1}
						decimal={2}
						validator={valibotValidator(donationSchema)}
						name="donationPct"
						id="donationPct"
					/>

					<NumberInput
						label="Moc instalacji (kWp)"
						value={pvPower}
						onChange={setPvPower}
						validator={valibotValidator(getPvPowerSchema(communeSize))}
						min={0}
						max={500}
						step={1}
						name="pvPower"
					/>

					<div>
						<Toggle
							label="Użyć magazynu energii"
							checked={storageEnabled}
							onChange={setStorageEnabled}
							name="storageEnabled"
						/>
					</div>

					{solarError ? (
						<div className="sm:col-span-2 text-sm text-red-600">
							{solarError.message ?? String(solarError)}
						</div>
					) : null}
					{solarData ? (
						<SolarSeasonalChart
							apiResponse={solarData}
							isRefetching={solarLoading}
						/>
					) : (
						<div />
					)}
				</div>
			</section>

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
