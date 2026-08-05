import { BOND_RATIO_SUGGEST_STEP, MIN_GROUP_WEIGHT } from '@/lib/data/constants';
import type { FeasibilityResult } from '@/lib/types/result';

/** Bond ratios below `current`, highest first — 0 is allowed, values under the group minimum are not. */
export function bondCandidatesBelow(current: number): number[] {
  const candidates: number[] = [];
  for (let ratio = current - BOND_RATIO_SUGGEST_STEP; ratio > 0; ratio -= BOND_RATIO_SUGGEST_STEP) {
    const rounded = Number(ratio.toFixed(4));
    if (rounded >= MIN_GROUP_WEIGHT) candidates.push(rounded);
  }
  if (current > 0) candidates.push(0);
  return candidates;
}

export interface FeasibilityParams {
  targetMonthlyNetUsd: number;
  monthlyNetUsd: number;
  maxMonthlyNetUsd: number;
  principalUsd: number;
  bondRatio: number | null;
  /** Returns the best net monthly income reachable at a given bond ratio. */
  probeBondRatio?: (bondRatio: number) => number;
}

function findSuggestedBondRatio(params: FeasibilityParams): number | null {
  const { bondRatio, probeBondRatio, targetMonthlyNetUsd } = params;
  if (bondRatio === null || bondRatio <= 0 || !probeBondRatio) return null;

  for (const candidate of bondCandidatesBelow(bondRatio)) {
    if (probeBondRatio(candidate) >= targetMonthlyNetUsd) return candidate;
  }
  return null;
}

function buildSuggestion(suggestedBondRatio: number | null): string {
  if (suggestedBondRatio !== null) {
    return `채권 비중을 ${Number((suggestedBondRatio * 100).toFixed(2))}%로 낮추면 목표를 달성할 수 있습니다.`;
  }
  return '현재 배분으로는 목표에 도달하지 못합니다. 원금을 늘리거나 목표 월 수령액을 낮춰 보세요.';
}

export function buildFeasibility(params: FeasibilityParams): FeasibilityResult {
  const { targetMonthlyNetUsd, monthlyNetUsd, maxMonthlyNetUsd, principalUsd } = params;
  const achievable = monthlyNetUsd >= targetMonthlyNetUsd;
  const requiredPrincipalUsd =
    achievable || maxMonthlyNetUsd <= 0
      ? principalUsd
      : (principalUsd * targetMonthlyNetUsd) / maxMonthlyNetUsd;
  const suggestedBondRatio = achievable ? null : findSuggestedBondRatio(params);

  return {
    achievable,
    monthlyNetUsd,
    targetMonthlyNetUsd,
    attainmentRate: targetMonthlyNetUsd > 0 ? monthlyNetUsd / targetMonthlyNetUsd : 1,
    maxMonthlyNetUsd,
    requiredPrincipalUsd,
    suggestedBondRatio,
    suggestion: achievable ? null : buildSuggestion(suggestedBondRatio),
  };
}
