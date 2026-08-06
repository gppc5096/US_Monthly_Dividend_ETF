'use client';

import { useEffect, useState } from 'react';

import { ensureAnonUser } from '@/lib/firebase/anonAuth';

export interface AnonUserState {
  uid: string | null;
  isLoading: boolean;
  error: string | null;
}

const SIGN_IN_FAILED = '익명 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';

/** Signs in anonymously on mount (PRD §9.2) so Firestore rules can match the uid. */
export function useAnonUser(): AnonUserState {
  const [state, setState] = useState<AnonUserState>({
    uid: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    ensureAnonUser()
      .then((user) => {
        if (active) setState({ uid: user.uid, isLoading: false, error: null });
      })
      .catch((cause) => {
        console.warn('[useAnonUser] 익명 로그인 실패', cause);
        if (active) setState({ uid: null, isLoading: false, error: SIGN_IN_FAILED });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
