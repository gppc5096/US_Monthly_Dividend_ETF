import { ETFS, type Ticker } from '@/lib/data/etfs';
import type { MarketSnapshot, QuoteMap } from '@/lib/types/etf';

/** Static yields from the ETF master — used when the quote API is unreachable. */
export const FALLBACK_QUOTES: QuoteMap = Object.fromEntries(
  ETFS.map((etf) => [etf.ticker, { yield: etf.fallbackYield }]),
) as Record<Ticker, { yield: number }>;

export const FALLBACK_AS_OF = '2026-08-05T00:00:00.000Z';

export const FALLBACK_SNAPSHOT: MarketSnapshot = {
  quotes: FALLBACK_QUOTES,
  asOf: FALLBACK_AS_OF,
  isFallback: true,
};

/** USD-based reference rates for offline/manual use. */
export const FALLBACK_FX_RATES = {
  USD: 1,
  EUR: 0.92,
  JPY: 152,
  GBP: 0.78,
  AUD: 1.52,
  CAD: 1.37,
  CHF: 0.88,
  NZD: 1.66,
  SGD: 1.34,
  MXN: 17.2,
  INR: 83.5,
  RUB: 92,
  GEL: 2.68,
  BRL: 5.1,
  TWD: 32.3,
  THB: 35.6,
  TRY: 32.5,
  PHP: 58.2,
  KRW: 1380,
} as const;
