import 'server-only';

import { getAdminFirestore } from '@/lib/firebase/admin';

const MARKET_COLLECTION = 'marketData';

export const QUOTES_CACHE_DOC = 'etfQuotes';
export const FX_CACHE_DOC = 'fxRates';

export interface CacheHit<T> {
  data: T;
  updatedAt: string;
}

/** Returns null on a miss, an expired entry, or when Firestore is unavailable. */
export async function readMarketCache<T>(docId: string, ttlMs: number): Promise<CacheHit<T> | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  try {
    const snapshot = await db.collection(MARKET_COLLECTION).doc(docId).get();
    const raw = snapshot.data();
    const updatedAt = raw?.updatedAt;
    if (typeof updatedAt !== 'string') return null;

    const ageMs = Date.now() - Date.parse(updatedAt);
    if (!Number.isFinite(ageMs) || ageMs > ttlMs) return null;

    return { data: raw as T, updatedAt };
  } catch (error) {
    console.warn(`[market/cache] ${docId} 읽기 실패 — 외부 API 단계로 진행합니다.`, error);
    return null;
  }
}

/** Returns the asOf timestamp regardless of whether the write reached Firestore. */
export async function writeMarketCache(docId: string, data: Record<string, unknown>): Promise<string> {
  const updatedAt = new Date().toISOString();
  const db = getAdminFirestore();
  if (!db) return updatedAt;

  try {
    await db.collection(MARKET_COLLECTION).doc(docId).set({ ...data, updatedAt });
  } catch (error) {
    console.warn(`[market/cache] ${docId} 쓰기 실패 — 응답에는 영향이 없습니다.`, error);
  }
  return updatedAt;
}
