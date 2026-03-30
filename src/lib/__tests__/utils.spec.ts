import { describe, expect, test } from "vitest";
import { formatYears } from "../utils";

describe("formatYears", () => {
	// Całe lata
	test("1 rok", () => expect(formatYears(1)).toBe("1 rok"));
	test("2 lata", () => expect(formatYears(2)).toBe("2 lata"));
	test("3 lata", () => expect(formatYears(3)).toBe("3 lata"));
	test("4 lata", () => expect(formatYears(4)).toBe("4 lata"));
	test("5 lat", () => expect(formatYears(5)).toBe("5 lat"));
	test("10 lat", () => expect(formatYears(10)).toBe("10 lat"));
	test("25 lat", () => expect(formatYears(25)).toBe("25 lat"));

	// Tylko miesiące (< 1 rok)
	test("1 miesiąc", () => expect(formatYears(1 / 12)).toBe("1 miesiąc"));
	test("2 miesiące", () => expect(formatYears(2 / 12)).toBe("2 miesiące"));
	test("4 miesiące", () => expect(formatYears(4 / 12)).toBe("4 miesiące"));
	test("5 miesięcy", () => expect(formatYears(5 / 12)).toBe("5 miesięcy"));
	test("11 miesięcy", () => expect(formatYears(11 / 12)).toBe("11 miesięcy"));

	// Lata i miesiące
	test("1 rok i 1 miesiąc", () => expect(formatYears(1 + 1 / 12)).toBe("1 rok i 1 miesiąc"));
	test("1 rok i 2 miesiące", () => expect(formatYears(1.125)).toBe("1 rok i 2 miesiące")); // ceil(0.125*12=1.5) = 2
	test("1 rok i 5 miesięcy", () => expect(formatYears(1.375)).toBe("1 rok i 5 miesięcy")); // ceil(0.375*12=4.5) = 5
	test("2 lata i 3 miesiące", () => expect(formatYears(2 + 3 / 12)).toBe("2 lata i 3 miesiące"));
	test("5 lat i 6 miesięcy", () => expect(formatYears(5 + 6 / 12)).toBe("5 lat i 6 miesięcy"));
	test("10 lat i 11 miesięcy", () => expect(formatYears(10 + 11 / 12)).toBe("10 lat i 11 miesięcy"));

	// Zaokrąglenie w górę (ceil)
	test("2.3 lat → 2 lata i 4 miesiące", () => expect(formatYears(2.3)).toBe("2 lata i 4 miesiące"));
	test("3.1 lat → 3 lata i 2 miesiące", () => expect(formatYears(3.1)).toBe("3 lata i 2 miesiące"));
	test("1.01 lat → 1 rok i 1 miesiąc (ceil)", () => expect(formatYears(1.01)).toBe("1 rok i 1 miesiąc"));

	// Overflow: 11.92 lat → 11 lat + ceil(0.92*12=11.04) = 12 → przepełnienie na 12 lat
	test("overflow miesięcy → pełny rok", () => expect(formatYears(11 + 11.04 / 12)).toBe("12 lat"));
});
