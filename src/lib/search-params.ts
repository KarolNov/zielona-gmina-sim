import { CommuneType } from "#/lib/types";

export const searchDefaults = {
	communeSize: CommuneType.SMALL,
	donation: 0,
	pvPower: 10,
	storageEnabled: false,
	storagePct: 50,
	degradacja: 0.5,
	katNachylenia: 35,
	cenaEnergii: 1.2,
	cenaEnergiiImport: 1.4,
	inflacjaEnergii: 3,
	loanEnabled: false,
	loanRate: 7,
	loanTerm: 15,
	loanShare: 100,
	lat: 52.2297,
	lon: 21.0122,
} as const;

export type SearchParams = {
	communeSize: CommuneType;
	donation: number;
	pvPower: number;
	storageEnabled: boolean;
	storagePct: number;
	degradacja: number;
	katNachylenia: number;
	cenaEnergii: number;
	cenaEnergiiImport: number;
	inflacjaEnergii: number;
	loanEnabled: boolean;
	loanRate: number;
	loanTerm: number;
	loanShare: number;
	lat: number;
	lon: number;
};

export function num(raw: unknown, fallback: number): number {
	const n = Number(raw);
	return Number.isNaN(n) ? fallback : n;
}
