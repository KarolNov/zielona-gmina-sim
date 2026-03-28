import * as v from "valibot";
export const cenaSprzedazySchema = v.pipe(
	v.number("Cena sprzedaży musi być liczbą"),
	v.minValue(0, "Cena sprzedaży nie może być ujemna"),
	v.maxValue(3, "Cena sprzedaży nie może przekroczyć 3,00 PLN/kWh"),
);
