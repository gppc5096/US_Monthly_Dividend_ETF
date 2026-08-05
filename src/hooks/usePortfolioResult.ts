'use client';

import { useMemo } from 'react';

import { useQuotes } from '@/hooks/useQuotes';
import { runPortfolio } from '@/lib/calc';
import type { PortfolioInput, PortfolioResult } from '@/lib/schema/portfolioInput';
import { selectPortfolioInput } from '@/store/wizardSelectors';
import { useWizardStore } from '@/store/wizardStore';

export interface PortfolioResultState {
  input: PortfolioInput | null;
  result: PortfolioResult | null;
  error: string | null;
  isLoading: boolean;
}

export function usePortfolioResult(): PortfolioResultState {
  const state = useWizardStore();
  const { snapshot, isLoading } = useQuotes();
  const input = useMemo(() => selectPortfolioInput(state), [state]);

  const { result, error } = useMemo(() => {
    if (!input) return { result: null, error: null };
    try {
      return { result: runPortfolio(input, snapshot), error: null };
    } catch (cause) {
      return { result: null, error: cause instanceof Error ? cause.message : '계산에 실패했습니다.' };
    }
  }, [input, snapshot]);

  return { input, result, error, isLoading };
}
