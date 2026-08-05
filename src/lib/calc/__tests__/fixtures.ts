import { FALLBACK_SNAPSHOT } from '@/lib/data/fallbackQuotes';
import type { FxRates, PortfolioInput } from '@/lib/schema/portfolioInput';
import type { MarketSnapshot } from '@/lib/types/etf';

export const MARKET: MarketSnapshot = FALLBACK_SNAPSHOT;

export const FX: FxRates = { USD: 1, KRW: 1380, PHP: 58.2 };

export const PRINCIPAL_USD = 1_000_000;

export function autoInput(overrides: Partial<PortfolioInput> = {}): PortfolioInput {
  return {
    mode: 'auto',
    principal: { amount: PRINCIPAL_USD, currency: 'USD' },
    targetMonthlyNet: { amount: 6_000, currency: 'USD' },
    residenceCountry: 'KR',
    displayCurrencies: ['KRW', 'USD', 'PHP'],
    tax: { usWithholdingRate: 0.15, residentTaxRate: 0.154, creditForeignTax: true },
    fxRates: FX,
    bondRatio: 0.2,
    ...overrides,
  };
}

export function manualInput(
  manualHoldings: PortfolioInput['manualHoldings'],
  overrides: Partial<PortfolioInput> = {},
): PortfolioInput {
  return { ...autoInput(), bondRatio: undefined, mode: 'manual', manualHoldings, ...overrides };
}
