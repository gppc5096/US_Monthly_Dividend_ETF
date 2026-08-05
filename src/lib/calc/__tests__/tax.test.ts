import { describe, expect, it } from 'vitest';

import { runPortfolio } from '@/lib/calc/index';
import { computeTax } from '@/lib/calc/tax';
import type { TaxSettings } from '@/lib/schema/portfolioInput';
import { autoInput, manualInput, MARKET } from './fixtures';

const KR_TAX: TaxSettings = { usWithholdingRate: 0.15, residentTaxRate: 0.154, creditForeignTax: true };

describe('원천징수 면제 (SGOV)', () => {
  it('withholdingExempt 종목은 미국 원천징수에서 제외된다', () => {
    const summary = computeTax(
      [
        { annualGrossUsd: 1_000, withholdingExempt: false },
        { annualGrossUsd: 1_000, withholdingExempt: true },
      ],
      { ...KR_TAX, creditForeignTax: false },
    );

    expect(summary.usWithheld).toBe(150);
    expect(summary.residentTax).toBeCloseTo(308, 6);
    expect(summary.netUsd).toBeCloseTo(1_542, 6);
  });

  it('포트폴리오 결과에서도 SGOV만 원천징수액이 0이다', () => {
    const result = runPortfolio(autoInput(), MARKET);
    const sgov = result.holdings.find((holding) => holding.ticker === 'SGOV');
    const tltw = result.holdings.find((holding) => holding.ticker === 'TLTW');

    expect(sgov?.withholdingExempt).toBe(true);
    expect(sgov?.usWithheldUsd).toBe(0);
    expect(tltw?.usWithheldUsd).toBeGreaterThan(0);
  });
});

describe('외국납부세액공제', () => {
  it('공제 적용 시 거주국 추가세가 원천징수액만큼 줄어든다', () => {
    const items = [{ annualGrossUsd: 10_000, withholdingExempt: false }];
    const withCredit = computeTax(items, KR_TAX);
    const withoutCredit = computeTax(items, { ...KR_TAX, creditForeignTax: false });

    expect(withCredit.residentTax).toBeCloseTo(40, 6);
    expect(withoutCredit.residentTax).toBeCloseTo(1_540, 6);
    expect(withCredit.netUsd).toBeGreaterThan(withoutCredit.netUsd);
    expect(withCredit.effectiveRate).toBeCloseTo(0.154, 6);
    expect(withoutCredit.effectiveRate).toBeCloseTo(0.304, 6);
  });

  it('같은 배분에서 공제 on/off 에 따라 세후 수령액이 달라진다', () => {
    const input = manualInput([
      { ticker: 'SPYI', weight: 0.5 },
      { ticker: 'QQQI', weight: 0.5 },
    ]);
    const on = runPortfolio(input, MARKET);
    const off = runPortfolio({ ...input, tax: { ...input.tax, creditForeignTax: false } }, MARKET);

    expect(on.net.annualUsd).toBeCloseTo(105_750, 4);
    expect(off.net.annualUsd).toBeCloseTo(87_000, 4);
    expect(on.net.monthlyUsd).toBeGreaterThan(off.net.monthlyUsd);
  });

  it('원천징수가 거주국 세율보다 높으면 추가세는 0이다', () => {
    const summary = computeTax([{ annualGrossUsd: 10_000, withholdingExempt: false }], {
      ...KR_TAX,
      residentTaxRate: 0.1,
    });

    expect(summary.residentTax).toBe(0);
  });
});
