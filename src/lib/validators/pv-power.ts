import * as v from "valibot";
import { CommuneType } from "../types";

// FUTURE: do max power as warning not error, and allow to go above with a message about it being unrealistic and not recommended
export const getPvPowerSchema = (communeSize: CommuneType) => {
  switch (communeSize) {
    case CommuneType.SMALL:
        return v.pipe(
            v.number("Moc paneli fotowoltaicznych musi być liczbą"),
            v.minValue(0, "Moc paneli fotowoltaicznych nie może być ujemna"),
            v.maxValue(1000, "Moc paneli fotowoltaicznych jest zbyt duża"),
        );
    case CommuneType.MEDIUM:
        return v.pipe(
            v.number("Moc paneli fotowoltaicznych musi być liczbą"),
            v.minValue(0, "Moc paneli fotowoltaicznych nie może być ujemna"),
            v.maxValue(5000, "Moc paneli fotowoltaicznych jest zbyt duża"),
        );
    case CommuneType.LARGE:
        return v.pipe(
            v.number("Moc paneli fotowoltaicznych musi być liczbą"),
            v.minValue(0, "Moc paneli fotowoltaicznych nie może być ujemna"),
            v.maxValue(20000, "Moc paneli fotowoltaicznych jest zbyt duża"),
        );
  }
}