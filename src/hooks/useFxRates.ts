'use client';

import { useEffect, useState } from 'react';

import { FALLBACK_AS_OF, FALLBACK_FX_RATES } from '@/lib/data/fallbackQuotes';
import type { FxSnapshot } from '@/lib/types/etf';
import { useWizardStore } from '@/store/wizardStore';

const FALLBACK: FxSnapshot = {
  rates: FALLBACK_FX_RATES,
  asOf: FALLBACK_AS_OF,
  isFallback: true,
};

/** Fetches USD-based rates once and pushes them into the store, keeping manual overrides. */
export function useFxRates(): { snapshot: FxSnapshot; isLoading: boolean } {
  const applyFxSnapshot = useWizardStore((state) => state.applyFxSnapshot);
  const [snapshot, setSnapshot] = useState<FxSnapshot>(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/fx', { signal: controller.signal })
      .then((response) => response.json() as Promise<FxSnapshot>)
      .then((next) => {
        setSnapshot(next);
        applyFxSnapshot(next.rates);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [applyFxSnapshot]);

  return { snapshot, isLoading };
}
