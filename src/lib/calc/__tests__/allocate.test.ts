import { describe, expect, it } from 'vitest';

import { sumWeights } from '@/lib/calc/allocate';
import { runPortfolio } from '@/lib/calc/index';
import { EQUITY_NASDAQ_SHARE_MAX_BP, WEIGHT_BP_TOTAL } from '@/lib/data/constants';
import { autoInput, MARKET } from './fixtures';

const nasdaqTickers = (holdings: { ticker: string; group: string }[]) =>
  holdings.filter((holding) => holding.group === 'nasdaq100').map((holding) => holding.ticker).sort();

describe('STEP 3 — 균등분산', () => {
  it('균등분산으로 목표를 달성하면 STEP3에서 확정한다', () => {
    const result = runPortfolio(autoInput({ targetMonthlyNet: { amount: 6_000, currency: 'USD' } }), MARKET);

    expect(result.allocation.stage).toBe('STEP3');
    expect(result.holdings).toHaveLength(10);
    expect(result.feasibility.achievable).toBe(true);
    expect(result.net.monthlyUsd).toBeCloseTo(6_979.5, 4);
  });
});

describe('STEP 4 — 상위 2종목 압축', () => {
  it('균등분산이 미달이면 그룹별 상위 2종목으로 압축해 달성한다', () => {
    const result = runPortfolio(autoInput({ targetMonthlyNet: { amount: 7_200, currency: 'USD' } }), MARKET);

    expect(result.allocation.stage).toBe('STEP4');
    expect(result.holdings).toHaveLength(6);
    expect(result.net.monthlyUsd).toBeCloseTo(7_684.5, 4);
    expect(result.feasibility.achievable).toBe(true);
  });

  it('배당률 동률이면 티커 알파벳 오름차순으로 항상 같은 종목을 고른다', () => {
    const input = autoInput({ targetMonthlyNet: { amount: 7_200, currency: 'USD' } });
    const first = runPortfolio(input, MARKET);
    const second = runPortfolio(input, MARKET);

    // QYLD와 QNTA는 모두 11% — 알파벳 우선순위로 QNTA가 선택되어야 한다.
    expect(nasdaqTickers(first.holdings)).toEqual(['QNTA', 'QQQI']);
    expect(nasdaqTickers(second.holdings)).toEqual(nasdaqTickers(first.holdings));
    expect(second.holdings).toEqual(first.holdings);
  });
});

describe('STEP 5 — S&P → 나스닥 이동', () => {
  it('목표 달성 시점(1%p 단위)에 정확히 정지한다', () => {
    const result = runPortfolio(autoInput({ targetMonthlyNet: { amount: 7_700, currency: 'USD' } }), MARKET);

    expect(result.allocation.stage).toBe('STEP5');
    expect(result.allocation.nasdaqShareOfEquity).toBe(0.52);
    expect(result.allocation.groupWeights.nasdaq100).toBe(0.416);
    expect(result.allocation.groupWeights.sp500).toBe(0.384);
    // 직전 단계(51%)는 목표에 미달하므로 더 적게 이동할 수는 없다.
    expect(result.net.monthlyUsd).toBeGreaterThanOrEqual(7_700);
    expect(result.net.monthlyUsd).toBeCloseTo(7_707.06, 4);
  });

  it('나스닥 비중은 주식군의 70% 상한을 넘지 않는다', () => {
    const result = runPortfolio(autoInput({ targetMonthlyNet: { amount: 20_000, currency: 'USD' } }), MARKET);
    const cap = EQUITY_NASDAQ_SHARE_MAX_BP / WEIGHT_BP_TOTAL;
    const { sp500, nasdaq100 } = result.allocation.groupWeights;

    expect(result.allocation.stage).toBe('STEP6');
    expect(result.allocation.nasdaqShareOfEquity).toBeLessThanOrEqual(cap);
    expect(nasdaq100).toBeLessThanOrEqual((sp500 + nasdaq100) * cap + 1e-9);
    expect(nasdaq100).toBe(0.56);
  });
});

describe('STEP 6 — 달성 불가', () => {
  it('미달 시 최대 가능액·필요 원금·조정 제안을 함께 돌려준다', () => {
    const result = runPortfolio(autoInput({ targetMonthlyNet: { amount: 20_000, currency: 'USD' } }), MARKET);

    expect(result.feasibility.achievable).toBe(false);
    expect(result.feasibility.maxMonthlyNetUsd).toBeGreaterThan(0);
    expect(result.feasibility.requiredPrincipalUsd).toBeGreaterThan(1_000_000);
    expect(result.feasibility.suggestion).not.toBeNull();
  });

  it('채권 비중을 낮추면 달성 가능한 경우 그 비중을 제안한다', () => {
    const result = runPortfolio(
      autoInput({ targetMonthlyNet: { amount: 7_950, currency: 'USD' }, bondRatio: 0.5 }),
      MARKET,
    );

    expect(result.feasibility.achievable).toBe(false);
    expect(result.feasibility.suggestedBondRatio).not.toBeNull();
    expect(result.feasibility.suggestedBondRatio as number).toBeLessThan(0.5);
    expect(result.feasibility.suggestion).toContain('채권 비중');
  });
});

describe('가드레일 — 비중 합계', () => {
  const cases = [
    { bondRatio: 0, target: 6_000 },
    { bondRatio: 0.05, target: 7_700 },
    { bondRatio: 0.2, target: 7_200 },
    { bondRatio: 0.5, target: 20_000 },
  ];

  it.each(cases)('bondRatio=$bondRatio 에서 합계가 정확히 100%다', ({ bondRatio, target }) => {
    const result = runPortfolio(
      autoInput({ bondRatio, targetMonthlyNet: { amount: target, currency: 'USD' } }),
      MARKET,
    );

    expect(sumWeights(result.holdings)).toBe(1);
    for (const holding of result.holdings) {
      expect(holding.weight).toBeLessThanOrEqual(0.4);
    }
  });
});
