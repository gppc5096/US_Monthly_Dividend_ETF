import 'server-only';

import { MARKET_FETCH_TIMEOUT_MS } from '@/lib/data/constants';
import { BASE_CURRENCY, CURRENCY_CODES } from '@/lib/data/countries';
import type { FxRates } from '@/lib/schema/portfolioInput';

const FX_ENDPOINT = 'https://api.exchangerate.host/live';

interface ExchangerateLiveResponse {
  success?: unknown;
  quotes?: Record<string, unknown>;
}

/**
 * Fetches every supported currency in one call so the cached document can serve
 * any `?symbols=` combination. Returns null when FX_API_KEY is absent or the
 * provider is unreachable.
 */
export async function fetchFxRates(): Promise<FxRates | null> {
  const apiKey = process.env.FX_API_KEY;
  if (!apiKey) return null;

  const wanted = CURRENCY_CODES.filter((code) => code !== BASE_CURRENCY);
  const query = new URLSearchParams({
    access_key: apiKey,
    source: BASE_CURRENCY,
    currencies: wanted.join(','),
  });

  try {
    const response = await fetch(`${FX_ENDPOINT}?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(MARKET_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`exchangerate.host ${response.status} ${response.statusText}`);

    const body = (await response.json()) as ExchangerateLiveResponse;
    if (body.success !== true || !body.quotes) throw new Error('환율 응답 형식이 올바르지 않습니다.');

    const rates: FxRates = { [BASE_CURRENCY]: 1 };
    for (const currency of wanted) {
      const value = body.quotes[`${BASE_CURRENCY}${currency}`];
      if (typeof value === 'number' && value > 0) rates[currency] = value;
    }

    return rates;
  } catch (error) {
    console.warn('[market/fxProvider] 환율 조회 실패 — 정적 폴백으로 전환합니다.', error);
    return null;
  }
}
