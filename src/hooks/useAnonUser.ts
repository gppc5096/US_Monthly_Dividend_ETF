'use client';

/** Stub until P5 wires Firebase anonymous auth (PRD §9.2). */
export function useAnonUser(): { uid: string | null; isLoading: boolean } {
  return { uid: null, isLoading: false };
}
