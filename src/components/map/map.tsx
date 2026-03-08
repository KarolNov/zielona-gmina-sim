import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { LatLngBounds } from "leaflet";
import { useEffect } from "react";

function MapController({
	onLocationChange,
}: {
	onLocationChange: (lat: number, lng: number) => void;
}) {
	const map = useMapEvents(
		{
			click(e: any) {
				onLocationChange(e.latlng.lat, e.latlng.lng);
			},
			geosearch_showlocation(e: any) {
				onLocationChange(e.location.y, e.location.x);
			},
		} as unknown as Parameters<
			typeof useMapEvents
		>[0] /* workaround for missing types in leaflet-geosearch */,
	);

	useEffect(() => {
		const provider = new OpenStreetMapProvider();
		const searchControl = GeoSearchControl({
			provider: provider,
			style: "bar",
			autoClose: true,
			searchLabel: "Wpisz nazwę gminy...",
		});
		map.addControl(searchControl);
		return () => {
			map.removeControl(searchControl);
		};
	}, [map]);

	return null;
}

const latLngBounds = new LatLngBounds([
	[49.0, 14.07], // Southwest corner of Poland
	[54.5, 24.09], // Northeast corner of Poland
]);
export default function SolarMap({
	onLocationSelect,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
}) {
	if (typeof window === "undefined") {
		return (
			<div className="h-100 w-full rounded-lg bg-gray-200 flex items-center justify-center">
				<span>Loading map...</span>
			</div>
		);
	}
	return (
		<MapContainer bounds={latLngBounds} className="h-100 w-full rounded-lg">
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			<MapController onLocationChange={onLocationSelect} />
		</MapContainer>
	);
}
