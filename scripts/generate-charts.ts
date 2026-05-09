/**
 * Generates two PNG sensitivity charts:
 *   1. npv-price-scenarios.png — "Wpływ wahań cen energii na NPV"
 *   2. pbp-vs-autoconsumption.png — "Okres zwrotu (PBP) vs. autokonsumpcja"
 *
 * Usage:
 *   npx tsx scripts/generate-charts.ts [outputDir]
 *
 * Default output directory is ./out/charts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import type { ChartConfiguration } from "chart.js";

import { getAutoconsumptionRate } from "#/engine/autoconsumption";
import {
  runSensitivityAnalysis,
  runPriceScenarioSensitivity,
} from "#/engine/sensitivity";
import type { SimulationInput } from "#/engine/types";
import { getSolarSummary } from "#/lib/api/pvgis";
import { searchDefaults } from "#/lib/search-params";
import { CommuneType } from "#/lib/types";

// ---------------------------------------------------------------------------
// Build SimulationInput from searchDefaults + live PVGIS data
// ---------------------------------------------------------------------------
async function buildInput(): Promise<SimulationInput> {
  const d = searchDefaults;

  console.log(
    `Pobieranie danych PVGIS dla lat=${d.lat}, lon=${d.lon}, ${d.pvPower} kWp, kąt=${d.katNachylenia}°…`,
  );
  const solar = await getSolarSummary(d.lat, d.lon, d.pvPower, d.katNachylenia);
  console.log(
    `PVGIS → roczny uzysk: ${solar.annualYield.toLocaleString("pl-PL")} kWh`,
  );

  return {
    pvPower: d.pvPower,
    degradacja: d.degradacja / 100,
    cenaEnergii: d.cenaEnergii,
    cenaEnergiiImport: d.cenaEnergiiImport,
    annualDemand: d.annualDemand,
    inflacjaEnergii: d.inflacjaEnergii / 100,
    donation: d.donation,
    storageEnabled: d.storageEnabled,
    storageCapacity: d.storageEnabled
      ? Math.round(((d.pvPower * d.storagePct) / 100) * 10) / 10
      : 0,
    communeSize: d.communeSize,
    monthlyYields: solar.monthlyYields,
    annualYield: solar.annualYield,
    loanEnabled: d.loanEnabled,
    loanRate: d.loanRate / 100,
    loanTerm: d.loanTerm,
    loanShare: d.loanShare,
  };
}

// ---------------------------------------------------------------------------
// Chart renderer
// ---------------------------------------------------------------------------
const WIDTH = 1200;
const HEIGHT = 700;
const chartCanvas = new ChartJSNodeCanvas({
  width: WIDTH,
  height: HEIGHT,
  backgroundColour: "#ffffff",
});

const SCENARIO_COLORS: Record<string, string> = {
  Pesymistyczny: "#c0392b",
  Bazowy: "#2563eb",
  Optymistyczny: "#2e7d32",
};

function formatPLN(v: number): string {
  return (
    Math.round(v).toLocaleString("pl-PL", { maximumFractionDigits: 0 }) +
    " PLN"
  );
}

function rateLabel(r: number): string {
  return `${(r * 100).toFixed(0)}%`;
}

// ---------------------------------------------------------------------------
// Chart 1: NPV × price scenarios
// ---------------------------------------------------------------------------
async function renderNpvPriceScenarios(
  input: SimulationInput,
  modelRate: number,
): Promise<Buffer> {
  const scenarios = runPriceScenarioSensitivity(input);
  const rates = scenarios[0].points.map((p) => p.rate);

  const datasets = scenarios.map((s) => ({
    label: s.scenario,
    data: s.points.map((p) => p.npv),
    borderColor: SCENARIO_COLORS[s.scenario] ?? "#333",
    backgroundColor: "transparent",
    borderWidth: 2.5,
    pointRadius: 0,
    pointHitRadius: 6,
    tension: 0.3,
  }));

  const config: ChartConfiguration<"line"> = {
    type: "line",
    data: {
      labels: rates.map(rateLabel),
      datasets,
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Wpływ wahań cen energii na NPV",
          font: { size: 18, weight: "bold" },
          padding: { bottom: 4 },
        },
        subtitle: {
          display: true,
          text: "Pesymistyczny: −15% cen, inflacja ×0,5 │ Bazowy: bieżące │ Optymistyczny: +15% cen, inflacja ×1,5",
          font: { size: 12 },
          color: "#666",
          padding: { bottom: 16 },
        },
        legend: { position: "bottom", labels: { font: { size: 12 } } },
      },
      scales: {
        x: {
          title: { display: true, text: "Autokonsumpcja", font: { size: 13 } },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "NPV (PLN)", font: { size: 13 } },
          ticks: {
            callback: (v) => `${(Number(v) / 1000).toFixed(0)}k`,
          },
          grid: { color: "#eee" },
        },
      },
    },
  };

  return await chartCanvas.renderToBuffer(config);
}

// ---------------------------------------------------------------------------
// Chart 2: PBP vs autoconsumption
// ---------------------------------------------------------------------------
const PBP_DISPLAY_CAP = 30;

async function renderPbpVsAutoconsumption(
  input: SimulationInput,
  modelRate: number,
): Promise<Buffer> {
  const { points } = runSensitivityAnalysis(input, modelRate);
  const rates = points.map((p) => rateLabel(p.rate));
  const pbpData = points.map((p) =>
    Math.min(p.paybackYears, PBP_DISPLAY_CAP),
  );

  const config: ChartConfiguration<"line"> = {
    type: "line",
    data: {
      labels: rates,
      datasets: [
        {
          label: "Okres zwrotu (lata)",
          data: pbpData,
          borderColor: "#1a7a3a",
          backgroundColor: "rgba(26,122,58,0.08)",
          fill: true,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: "#1a7a3a",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Okres zwrotu (PBP) vs. autokonsumpcja",
          font: { size: 18, weight: "bold" },
          padding: { bottom: 16 },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          title: { display: true, text: "Autokonsumpcja", font: { size: 13 } },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: "Lata", font: { size: 13 } },
          ticks: {
            callback: (v) => `${Number(v).toFixed(0)} lat`,
          },
          grid: { color: "#eee" },
          suggestedMin: 0,
          suggestedMax: PBP_DISPLAY_CAP,
        },
      },
    },
  };

  return await chartCanvas.renderToBuffer(config);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const outDir = resolve(process.argv[2] ?? "out/charts");
  mkdirSync(outDir, { recursive: true });

  const input = await buildInput();
  const modelRate = getAutoconsumptionRate(
    input.communeSize,
    input.storageCapacity,
    input.pvPower,
    input.annualDemand,
    input.annualYield,
  );

  console.log(`Parametry: ${input.pvPower} kWp, ${input.communeSize}, AC=${rateLabel(modelRate)}`);

  const [npvBuf, pbpBuf] = await Promise.all([
    renderNpvPriceScenarios(input, modelRate),
    renderPbpVsAutoconsumption(input, modelRate),
  ]);

  const npvPath = resolve(outDir, "npv-price-scenarios.png");
  const pbpPath = resolve(outDir, "pbp-vs-autoconsumption.png");

  writeFileSync(npvPath, npvBuf);
  writeFileSync(pbpPath, pbpBuf);

  console.log(`\nWygenerowano wykresy:`);
  console.log(`  1. ${npvPath}`);
  console.log(`  2. ${pbpPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
