import { NextResponse } from 'next/server';

import { QUOTES_CACHE_TTL_MS } from '@/lib/data/constants';
import { FALLBACK_SNAPSHOT } from '@/lib/data/fallbackQuotes';
import { QUOTES_CACHE_DOC, readMarketCache, writeMarketCache } from '@/lib/market/cache';
import { fetchQuotes } from '@/lib/market/quotesProvider';
import type { MarketSnapshot, QuoteMap } from '@/lib/types/etf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await loadQuotes());
  } catch (error) {
    console.warn('[api/quotes] 예상치 못한 오류 — 정적 폴백으로 응답합니다.', error);
    return NextResponse.json(FALLBACK_SNAPSHOT);
  }
}

/** Firestore cache (24h) -> external provider -> static fallback. */
async function loadQuotes(): Promise<MarketSnapshot> {
  const cached = await readMarketCache<{ quotes?: QuoteMap }>(QUOTES_CACHE_DOC, QUOTES_CACHE_TTL_MS);
  if (cached?.data.quotes) {
    return { quotes: cached.data.quotes, asOf: cached.updatedAt, isFallback: false };
  }

  const fresh = await fetchQuotes();
  if (fresh) {
    const asOf = await writeMarketCache(QUOTES_CACHE_DOC, { quotes: fresh });
    return { quotes: fresh, asOf, isFallback: false };
  }

  return FALLBACK_SNAPSHOT;
}
