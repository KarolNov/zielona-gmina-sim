import { describe, expect, test } from 'vitest';
import { CommuneType } from '#/lib/types';
import { runSimulation, type SimulationInput } from '../index';

// Helper to build a base SimulationInput
function baseInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    pvPower: 100,
    degradacja: 0.005,
    cenaEnergii: 0.85,
    cenaSprzedazy: 0.25,
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
  test('project LCOE is independent of financing (loanShare)', () => {
    const inpNoLoan = baseInput({ loanEnabled: false, loanShare: 0 });
    const inpLoan100 = baseInput({ loanEnabled: true, loanShare: 100 });
    const inpLoan80 = baseInput({ loanEnabled: true, loanShare: 80 });

    const rNoLoan = runSimulation(inpNoLoan);
    const rLoan100 = runSimulation(inpLoan100);
    const rLoan80 = runSimulation(inpLoan80);

    // projectLcoe should be equal regardless of financing
    expect(rLoan100.projectLcoe).toBeCloseTo(rNoLoan.projectLcoe, 6);
    expect(rLoan80.projectLcoe).toBeCloseTo(rNoLoan.projectLcoe, 6);
  });

  test('owner payback should not be 0 when owner initial contribution is zero', () => {
    const inpLoan100 = baseInput({ loanEnabled: true, loanShare: 100 });
    const rLoan100 = runSimulation(inpLoan100);

    // If owner contributes nothing up-front, payback for the owner should not be 0
    // (immediate) — the owner still needs to recover future net cashflows after servicing debt.
    expect(rLoan100.paybackYears).toBeGreaterThan(0);
    // And owner payback should be comparable to project payback
    expect(rLoan100.ownerPayback).toBeCloseTo(rLoan100.paybackYears, 6);
  });

  test('discounted payback is shorter or equal to nominal payback', () => {
    const inp = baseInput({ loanEnabled: false });
    const result = runSimulation(inp);

    // Discounted payback should be shorter or equal to nominal payback
    // (money today is worth more than money tomorrow)
    expect(result.paybackYearsDiscounted).toBeLessThanOrEqual(result.paybackYears);
  });

  test('PROJECT payback is independent of financing, but EQUITY payback varies', () => {
    // Use much higher prices to make project viable
    const inpNoLoan = baseInput({ 
      loanEnabled: false,
      cenaEnergii: 3.0,  // much higher grid price
      cenaSprzedazy: 1.5,
    });
    const inpLoan80 = baseInput({ 
      loanEnabled: true, 
      loanShare: 80,
      cenaEnergii: 3.0,
      cenaSprzedazy: 1.5,
    });
    
    const rNoLoan = runSimulation(inpNoLoan);
    const rLoan80 = runSimulation(inpLoan80);

    // Project payback (paybackYears) should be the same regardless of financing
    // because it's based on operating cash flow and total CAPEX
    expect(rLoan80.paybackYears).toBeCloseTo(rNoLoan.paybackYears, 0);
    
    // If payback is finite and there's a loan:
    // with a loan, owner recovers their smaller contribution (down payment) faster
    // so ownerPayback <= projectPayback when loanShare=80%
    if (Number.isFinite(rLoan80.ownerPayback) && Number.isFinite(rLoan80.paybackYears)) {
      expect(rLoan80.ownerPayback).toBeLessThanOrEqual(rLoan80.paybackYears);
    }
  });
});
