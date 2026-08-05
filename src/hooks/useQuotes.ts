'use client';

import { useEffect, useState } from 'react';

import { FALLBACK_SNAPSHOT } from '@/lib/data/fallbackQuotes';
import type { MarketSnapshot } from '@/lib/types/etf';

export function useQuotes(): { snapshot: MarketSnapshot; isLoading: boolean } {
  const [snapshot, setSnapshot] = useState<MarketSnapshot>(FALLBACK_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/quotes', { signal: controller.signal })
      .then((response) => response.json() as Promise<MarketSnapshot>)
      .then(setSnapshot)
      .catch(() => undefined)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { snapshot, isLoading };
}
