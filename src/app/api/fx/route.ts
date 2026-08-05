import { NextResponse } from 'next/server';

import { FX_CACHE_TTL_MS } from '@/lib/data/constants';
import { CURRENCY_CODES, type CurrencyCode } from '@/lib/data/countries';
import { FALLBACK_AS_OF, FALLBACK_FX_RATES } from '@/lib/data/fallbackQuotes';
import { FX_CACHE_DOC, readMarketCache, writeMarketCache } from '@/lib/market/cache';
import { fetchFxRates } from '@/lib/market/fxProvider';
import type { FxRates } from '@/lib/schema/portfolioInput';
import type { FxSnapshot } from '@/lib/types/etf';

export const dynamic = 'force-dynamic';

const FALLBACK_SNAPSHOT: FxSnapshot = {
  rates: FALLBACK_FX_RATES,
  asOf: FALLBACK_AS_OF,
  isFallback: true,
};

export async function GET(request: Request) {
  const symbols = parseSymbols(new URL(request.url).searchParams.get('symbols'));

  try {
    const snapshot = await loadFxRates();
    return NextResponse.json({ ...snapshot, rates: pick(snapshot.rates, symbols) });
  } catch (error) {
    console.warn('[api/fx] 예상치 못한 오류 — 정적 폴백으로 응답합니다.', error);
    return NextResponse.json({ ...FALLBACK_SNAPSHOT, rates: pick(FALLBACK_FX_RATES, symbols) });
  }
}

/** Firestore cache (12h) -> external provider -> static fallback. */
async function loadFxRates(): Promise<FxSnapshot> {
  const cached = await readMarketCache<{ rates?: FxRates }>(FX_CACHE_DOC, FX_CACHE_TTL_MS);
  if (cached?.data.rates) {
    return { rates: cached.data.rates, asOf: cached.updatedAt, isFallback: false };
  }

  const fresh = await fetchFxRates();
  if (fresh) {
    const asOf = await writeMarketCache(FX_CACHE_DOC, { base: 'USD', rates: fresh });
    return { rates: fresh, asOf, isFallback: false };
  }

  return FALLBACK_SNAPSHOT;
}

/** Unknown codes are dropped; an empty or missing query means "every currency". */
function parseSymbols(raw: string | null): CurrencyCode[] {
  if (!raw) return [...CURRENCY_CODES];

  const requested = raw.split(',').map((symbol) => symbol.trim().toUpperCase());
  const known = CURRENCY_CODES.filter((code) => requested.includes(code));
  return known.length > 0 ? known : [...CURRENCY_CODES];
}

function pick(rates: FxRates, symbols: readonly CurrencyCode[]): FxRates {
  const picked: FxRates = {};
  for (const symbol of symbols) {
    const rate = rates[symbol];
    if (rate !== undefined) picked[symbol] = rate;
  }
  return picked;
}
