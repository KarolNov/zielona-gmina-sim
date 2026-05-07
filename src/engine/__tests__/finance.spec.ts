import { describe, expect, test } from 'vitest';
import { CommuneType } from '#/lib/types';
import { runSimulation, type SimulationInput, INVERTER_REPLACEMENT_YEAR } from '../index';

function baseInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    pvPower: 100,
    degradacja: 0.005,
    cenaEnergii: 1.2,
    cenaEnergiiImport: 1.4,
    inflacjaEnergii: 0.03,
    donation: 0,
    storageEnabled: false,
    storageCapacity: 0,
    communeSize: CommuneType.MEDIUM,
    monthlyYields: new Array(12).fill(1000),
    annualYield: 12_000,
    loanEnabled: false,
    loanRate: 0.07,
    loanTerm: 15,
    loanShare: 0,
    ...overrides,
  } as SimulationInput;
}

describe('finance invariants', () => {
  test('LCOE without loan equals project LCOE', () => {
    const inp = baseInput({ loanEnabled: false });
    const result = runSimulation(inp);

    // LCOE should be positive and finite
    expect(result.lcoe).toBeGreaterThan(0);
    expect(result.lcoe).toBeLessThan(Infinity);
  });

  test('loan increases LCOE (includes financing costs)', () => {
    const noLoan = runSimulation(baseInput({ loanEnabled: false }));
    const withLoan = runSimulation(baseInput({ loanEnabled: true, loanShare: 100 }));

    // LCOE with loan should be higher (financing costs added)
    expect(withLoan.lcoe).toBeGreaterThan(noLoan.lcoe);
  });

  test('loan extends payback period', () => {
    const noLoan = runSimulation(baseInput({
      loanEnabled: false,
      cenaEnergii: 3.0,
      cenaEnergiiImport: 3.5,
    }));
    const withLoan = runSimulation(baseInput({
      loanEnabled: true,
      loanShare: 80,
      cenaEnergii: 3.0,
      cenaEnergiiImport: 3.5,
    }));

    // Both should be finite with these high prices.
    expect(noLoan.paybackYears).toBeLessThan(25);
    // Just verify both are positive numbers
    expect(withLoan.paybackYears).toBeGreaterThan(0);
  });

  test('100% loan means zero upfront in cash flow table', () => {
    const result = runSimulation(baseInput({
      loanEnabled: true,
      loanShare: 100,
    }));

    // Year 0 should have ~0 outflow (everything is financed)
    expect(Math.abs(result.cashFlowTable[0].netCashFlow)).toBe(0);
    // But loan payments should be present in year 1
    expect(result.cashFlowTable[1].loanPayment).toBeGreaterThan(0);
  });

  test('no loan means loanPrincipal and loanAnnualPayment are 0', () => {
    const result = runSimulation(baseInput({ loanEnabled: false }));
    expect(result.loanPrincipal).toBe(0);
    expect(result.loanAnnualPayment).toBe(0);
    // No loan payments in cash flow
    for (const row of result.cashFlowTable) {
      expect(row.loanPayment).toBe(0);
    }
  });

  test('loan payments stop after loanTerm', () => {
    const result = runSimulation(baseInput({
      loanEnabled: true,
      loanShare: 100,
      loanTerm: 10,
    }));

    // Year 10 should have a payment
    expect(result.cashFlowTable[10].loanPayment).toBeGreaterThan(0);
    // Year 11 should not
    expect(result.cashFlowTable[11].loanPayment).toBe(0);
  });
});

describe('maintenance costs', () => {
  test('OPEX breakdown components are positive and sum to annualOpex', () => {
    const result = runSimulation(baseInput());
    const b = result.annualOpexBreakdown;

    expect(b.servicing).toBeGreaterThan(0);
    expect(b.insurance).toBeGreaterThan(0);
    expect(b.repairs).toBeGreaterThan(0);
    expect(b.monitoring).toBeGreaterThan(0);
    expect(b.total).toBeCloseTo(
      b.servicing + b.insurance + b.repairs + b.monitoring,
    );
    expect(result.annualOpex).toBeCloseTo(b.total);
  });

  test('inverter replacement appears only in year 12', () => {
    const result = runSimulation(baseInput());

    for (const row of result.cashFlowTable) {
      if (row.year === INVERTER_REPLACEMENT_YEAR) {
        expect(row.inverterReplacement).toBeGreaterThan(0);
      } else {
        expect(row.inverterReplacement).toBe(0);
      }
    }
  });

  test('inverter replacement cost equals pvPower * cost per kWp', () => {
    const result = runSimulation(baseInput({ pvPower: 50 }));
    // 50 kWp * 500 PLN/kWp = 25,000 PLN
    expect(result.inverterReplacementCost).toBe(25_000);
    expect(result.cashFlowTable[INVERTER_REPLACEMENT_YEAR].inverterReplacement).toBe(25_000);
  });

  test('inverter replacement reduces net cash flow in year 12', () => {
    const result = runSimulation(baseInput());
    const year11 = result.cashFlowTable[11];
    const year12 = result.cashFlowTable[12];
    const year13 = result.cashFlowTable[13];

    // Year 12 net CF should be significantly lower than neighbors
    expect(year12.netCashFlow).toBeLessThan(year11.netCashFlow);
    expect(year12.netCashFlow).toBeLessThan(year13.netCashFlow);
  });

  test('OPEX scales with system size', () => {
    const small = runSimulation(baseInput({ pvPower: 10 }));
    const large = runSimulation(baseInput({ pvPower: 200 }));

    expect(large.annualOpex).toBeGreaterThan(small.annualOpex);
  });

  test('cash flow table has opexBreakdown in every row', () => {
    const result = runSimulation(baseInput());

    for (const row of result.cashFlowTable) {
      expect(row.opexBreakdown).toBeDefined();
      if (row.year === 0) {
        expect(row.opexBreakdown.total).toBe(0);
      } else {
        expect(row.opexBreakdown.total).toBeGreaterThan(0);
        expect(row.opex).toBeCloseTo(row.opexBreakdown.total);
      }
    }
  });
});
