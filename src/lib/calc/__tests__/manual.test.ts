import { describe, expect, it } from 'vitest';

import { sumWeights } from '@/lib/calc/allocate';
import { runPortfolio } from '@/lib/calc/index';
import { portfolioInputSchema } from '@/lib/schema/portfolioInput';
import { FX, manualInput, MARKET } from './fixtures';

describe('수동 모드 검증', () => {
  it('합계 99.9% 를 입력하면 검증 오류가 난다', () => {
    const parsed = portfolioInputSchema.safeParse(
      manualInput([
        { ticker: 'SPYI', weight: 0.5 },
        { ticker: 'QQQI', weight: 0.499 },
      ]),
    );

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.some((issue) => issue.message.includes('비중 합계'))).toBe(true);
  });

  it('합계 100% 를 입력하면 통과하고 그대로 계산된다', () => {
    const input = manualInput([
      { ticker: 'SPYI', weight: 0.5 },
      { ticker: 'QQQI', weight: 0.5 },
    ]);

    expect(portfolioInputSchema.safeParse(input).success).toBe(true);

    const result = runPortfolio(input, MARKET);
    expect(result.allocation.stage).toBe('MANUAL');
    expect(sumWeights(result.holdings)).toBe(1);
    // 0.5 × 11% + 0.5 × 14% = 12.5% 세전, 한국 기준 세후 84.6%
    expect(result.gross.annualUsd).toBeCloseTo(125_000, 4);
    expect(result.net.annualUsd).toBeCloseTo(105_750, 4);
  });

  it('같은 종목을 두 번 선택하면 검증 오류가 난다', () => {
    const parsed = portfolioInputSchema.safeParse(
      manualInput([
        { ticker: 'SPYI', weight: 0.5 },
        { ticker: 'SPYI', weight: 0.5 },
      ]),
    );

    expect(parsed.success).toBe(false);
  });
});

describe('자동 모드 입력 검증', () => {
  it('채권 비중이 0 초과 5% 미만이면 그룹 최소 비중 규칙에 걸린다', () => {
    const parsed = portfolioInputSchema.safeParse({
      ...manualInput([{ ticker: 'SPYI', weight: 1 }]),
      mode: 'auto',
      manualHoldings: undefined,
      bondRatio: 0.02,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('통화 변환', () => {
  it('표시 통화별로 USD 결과를 환산한다', () => {
    const result = runPortfolio(
      manualInput([
        { ticker: 'SPYI', weight: 0.5 },
        { ticker: 'QQQI', weight: 0.5 },
      ]),
      MARKET,
    );
    const krw = result.byCurrency.find((row) => row.currency === 'KRW');
    const usd = result.byCurrency.find((row) => row.currency === 'USD');

    expect(usd?.rate).toBe(1);
    expect(usd?.annualNet).toBeCloseTo(105_750, 4);
    expect(krw?.annualNet).toBeCloseTo(105_750 * (FX.KRW as number), 2);
    expect(result.byCurrency).toHaveLength(3);
  });
});
