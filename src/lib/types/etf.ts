import type { FxRates } from '@/lib/schema/portfolioInput';

export const ETF_GROUPS = ['sp500', 'nasdaq100', 'bond'] as const;
export type EtfGroup = (typeof ETF_GROUPS)[number];

export const ETF_GROUP_LABELS: Record<EtfGroup, string> = {
  sp500: 'S&P 500',
  nasdaq100: '나스닥100',
  bond: '채권',
};

export type EtfTaxType = 'dividend' | 'interest';

export interface EtfMaster {
  ticker: string;
  name: string;
  group: EtfGroup;
  /** Reference yield used only when the live quote is unavailable. */
  fallbackYield: number;
  taxType: EtfTaxType;
  /** US treasury-style products are exempt from the 15% withholding. */
  withholdingExempt: boolean;
}

export interface Quote {
  yield: number;
  price?: number;
}

export type QuoteMap = Record<string, Quote>;

export interface MarketSnapshot {
  quotes: QuoteMap;
  asOf: string;
  isFallback: boolean;
}

export interface FxSnapshot {
  rates: FxRates;
  asOf: string;
  isFallback: boolean;
}
