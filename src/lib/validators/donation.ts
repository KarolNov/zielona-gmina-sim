import * as v from "valibot";
export const donationSchema = v.pipe(
	v.number("Wartość donacji musi być liczbą"),
	v.minValue(0, "Wartość donacji nie może być ujemna"),
	v.maxValue(100, "Wartość donacji jest zbyt duża"),
);
