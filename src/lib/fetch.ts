import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot';
import { getSolarSummary } from './api/pvgis';

const SolarParams = v.object({
  lat: v.number(),
  lon: v.number(),
  pvPower: v.number(),
});

export const fetchSolarSummary = createServerFn({ method: 'GET'})
.inputValidator(SolarParams)
.handler(async (ctx) => {
  return getSolarSummary(ctx.data.lat, ctx.data.lon, ctx.data.pvPower);
})