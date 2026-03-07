import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { donationSchema } from "#/lib/validators/donation";
import { valibotValidator } from "#/lib/validators/valibot";
import NumberInput from "../components/inputs/NumberInput";
import Select from "../components/inputs/Select";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [communeSize, setCommuneSize] = useState("mala");
	const [donation, setDonation] = useState(0);

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
					Wprowadź parametry gminy i instalacji, aby oszacować zwrot z
					inwestycji.
				</p>
				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					<Select
						id="communeSize"
						label="Rozmiar gminy"
						value={communeSize}
						onChange={setCommuneSize}
						options={[
							{ value: "mala", label: "Mała (< 10 000)" },
							{ value: "srednia", label: "Średnia (10 000–50 000)" },
							{ value: "duza", label: "Duża (> 50 000)" },
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
				</div>
			</section>

			<section className="island-shell mt-8 rounded-2xl p-6">
				<p className="island-kicker mb-2">Jak korzystać?</p>
				<ul className="m-0 list-disc space-y-2 pl-5 text-sm text-(--sea-ink-soft)">
					<li>
						Wprowadź rozmiar gminy, procent dofinansowania, moc PV i dni
						słoneczne.
					</li>
					<li>Kliknij "Zastosuj".</li>
					<li>Później: wykresy, obliczenia ROI.</li>
				</ul>
			</section>
		</main>
	);
}
