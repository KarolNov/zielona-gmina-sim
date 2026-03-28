import NumberInput from "./NumberInput";

type LatLonInputProps = {
	lat: number;
	lon: number;
	onLatChange: (n: number) => void;
	onLonChange: (n: number) => void;
};

export default function LatLonInput({
	lat,
	lon,
	onLatChange,
	onLonChange,
}: LatLonInputProps) {
	return (
		<div className="grid sm:grid-cols-2 gap-4">
			<NumberInput
				id="lat"
				name="lat"
				label="Szerokość geogr. (lat)"
				value={lat}
				onChange={onLatChange}
				min={-90}
				max={90}
				step={0.0001}
			/>
			<NumberInput
				id="lon"
				name="lon"
				label="Długość geogr. (lon)"
				value={lon}
				onChange={onLonChange}
				min={-180}
				max={180}
				step={0.0001}
			/>
		</div>
	);
}
