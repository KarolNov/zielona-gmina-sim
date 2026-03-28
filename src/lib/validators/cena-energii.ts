import * as v from "valibot";
export const cenaEnergiiSchema = v.pipe(
	v.number("Cena energii musi być liczbą"),
	v.minValue(0.1, "Cena energii musi wynosić co najmniej 0,10 PLN/kWh"),
	v.maxValue(3, "Cena energii nie może przekroczyć 3,00 PLN/kWh"),
);
