import * as v from "valibot";
export const inflacjaSchema = v.pipe(
	v.number("Wartość inflacji musi być liczbą"),
	v.minValue(0, "Inflacja nie może być ujemna"),
	v.maxValue(15, "Inflacja nie może przekroczyć 15% rocznie"),
);
