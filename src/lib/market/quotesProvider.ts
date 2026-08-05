import 'server-only';

import { MARKET_FETCH_TIMEOUT_MS, PERCENT_DIVISOR } from '@/lib/data/constants';
import { ETFS, TICKERS, type Ticker } from '@/lib/data/etfs';
import type { Quote, QuoteMap } from '@/lib/types/etf';

const FMP_BASE = 'https://financialmodelingprep.com/api/v3';

interface FmpQuote {
  symbol?: unknown;
  price?: unknown;
}

interface FmpEtfInfo {
  yield?: unknown;
}

/** Returns null when MARKET_API_KEY is absent or the provider is unreachable. */
export async function fetchQuotes(): Promise<QuoteMap | null> {
  const apiKey = process.env.MARKET_API_KEY;
  if (!apiKey) return null;

  try {
    const [prices, yields] = await Promise.all([fetchPrices(apiKey), fetchYields(apiKey)]);
    return Object.fromEntries(
      ETFS.map((etf): [Ticker, Quote] => [
        etf.ticker,
        { yield: yields.get(etf.ticker) ?? etf.fallbackYield, price: prices.get(etf.ticker) },
      ]),
    );
  } catch (error) {
    console.warn('[market/quotesProvider] 시세 조회 실패 — 정적 폴백으로 전환합니다.', error);
    return null;
  }
}

async function fetchPrices(apiKey: string): Promise<Map<string, number>> {
  const rows = await getJson<FmpQuote[]>(`${FMP_BASE}/quote/${TICKERS.join(',')}`, apiKey);
  const prices = new Map<string, number>();
  if (!Array.isArray(rows)) return prices;

  for (const row of rows) {
    if (typeof row?.symbol === 'string' && typeof row.price === 'number' && row.price > 0) {
      prices.set(row.symbol, row.price);
    }
  }
  return prices;
}

/** One failed ticker must not sink the batch, so each yield is settled independently. */
async function fetchYields(apiKey: string): Promise<Map<string, number>> {
  const settled = await Promise.allSettled(
    TICKERS.map((ticker) => getJson<FmpEtfInfo[]>(`${FMP_BASE}/etf-info?symbol=${ticker}`, apiKey)),
  );

  const yields = new Map<string, number>();
  settled.forEach((result, index) => {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value)) return;

    const reported = result.value[0]?.yield;
    if (typeof reported !== 'number') return;

    const ratio = reported / PERCENT_DIVISOR;
    if (ratio > 0 && ratio <= 1) yields.set(TICKERS[index], ratio);
  });
  return yields;
}

async function getJson<T>(url: string, apiKey: string): Promise<T> {
  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}apikey=${encodeURIComponent(apiKey)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(MARKET_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`FMP ${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}
