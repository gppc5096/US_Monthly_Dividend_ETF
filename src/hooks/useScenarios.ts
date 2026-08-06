'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAnonUser } from '@/hooks/useAnonUser';
import { deleteScenario, listScenarios } from '@/lib/firebase/scenarios';
import type { Scenario } from '@/lib/types/scenario';

export interface ScenariosState {
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
  remove: (scenarioId: string) => Promise<void>;
}

interface LoadedScenarios {
  scenarios: Scenario[];
  error: string | null;
}

const LOAD_FAILED = '저장 목록을 불러오지 못했습니다.';

export function useScenarios(): ScenariosState {
  const { uid, isLoading: isAuthLoading, error: authError } = useAnonUser();
  const [loaded, setLoaded] = useState<LoadedScenarios | null>(null);

  const load = useCallback(
    (owner: string) =>
      listScenarios(owner)
        .then((scenarios) => setLoaded({ scenarios, error: null }))
        .catch((cause) => {
          console.warn('[useScenarios] 목록 조회 실패', cause);
          setLoaded({ scenarios: [], error: LOAD_FAILED });
        }),
    [],
  );

  useEffect(() => {
    if (uid) void load(uid);
  }, [load, uid]);

  const remove = useCallback(
    async (scenarioId: string) => {
      if (!uid) return;
      await deleteScenario(uid, scenarioId);
      await load(uid);
    },
    [load, uid],
  );

  return {
    scenarios: loaded?.scenarios ?? [],
    isLoading: isAuthLoading || (uid !== null && loaded === null),
    error: authError ?? loaded?.error ?? null,
    remove,
  };
}
