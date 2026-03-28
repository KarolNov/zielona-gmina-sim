import * as v from "valibot";
export const degradacjaSchema = v.pipe(
	v.number("Wartość degradacji musi być liczbą"),
	v.minValue(0, "Degradacja nie może być ujemna"),
	v.maxValue(2, "Degradacja nie może przekroczyć 2% rocznie"),
);
