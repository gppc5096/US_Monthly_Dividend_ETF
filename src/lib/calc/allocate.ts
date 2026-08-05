import { resolveYield } from '@/lib/calc/income';
import {
  EQUITY_NASDAQ_SHARE_MAX_BP,
  EQUITY_NASDAQ_SHARE_START_BP,
  EQUITY_SHIFT_STEP_BP,
  MAX_SINGLE_HOLDING_WEIGHT,
  MIN_GROUP_WEIGHT,
  TOP_HOLDINGS_PER_GROUP,
  WEIGHT_BP_TOTAL,
  WEIGHT_DECIMALS,
} from '@/lib/data/constants';
import { tickersInGroup, type Ticker } from '@/lib/data/etfs';
import type { ManualHolding } from '@/lib/schema/portfolioInput';
import { ETF_GROUPS, type EtfGroup, type QuoteMap } from '@/lib/types/etf';
import type {
  AllocationEvaluator,
  AllocationOutcome,
  AllocationStage,
  WeightMap,
} from '@/lib/types/result';

type GroupBp = Record<EtfGroup, number>;
type Selection = Record<EtfGroup, Ticker[]>;

interface Candidate {
  stage: AllocationStage;
  weights: WeightMap;
  groupBp: GroupBp;
  shareBp: number;
  net: number;
}

export function roundWeight(value: number): number {
  return Number(value.toFixed(WEIGHT_DECIMALS));
}

export function sumWeights(source: WeightMap | readonly { weight: number }[]): number {
  const values = Array.isArray(source)
    ? source.map((holding) => holding.weight)
    : Object.values(source as WeightMap);
  return roundWeight(values.reduce<number>((acc, value) => acc + (value ?? 0), 0));
}

/** Highest yield first; ties break on ticker A→Z so the same input always gives the same picks. */
export function rankByYield(tickers: readonly Ticker[], quotes: QuoteMap): Ticker[] {
  return [...tickers].sort((a, b) => {
    const byYield = resolveYield(b, quotes) - resolveYield(a, quotes);
    if (byYield !== 0) return byYield;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function splitBp(totalBp: number, count: number): number[] {
  const base = Math.floor(totalBp / count);
  const remainder = totalBp - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function groupBpFor(bondBp: number, nasdaqShareBp: number): GroupBp {
  const equityBp = WEIGHT_BP_TOTAL - bondBp;
  const nasdaqBp = Math.round((equityBp * nasdaqShareBp) / WEIGHT_BP_TOTAL);
  return { sp500: equityBp - nasdaqBp, nasdaq100: nasdaqBp, bond: bondBp };
}

function buildWeights(selection: Selection, groupBp: GroupBp): WeightMap {
  const weights: WeightMap = {};
  for (const group of ETF_GROUPS) {
    const tickers = selection[group];
    if (tickers.length === 0 || groupBp[group] === 0) continue;
    const parts = splitBp(groupBp[group], tickers.length);
    tickers.forEach((ticker, index) => {
      if (parts[index] > 0) weights[ticker] = parts[index] / WEIGHT_BP_TOTAL;
    });
  }
  return weights;
}

export function checkGuardrails(weights: WeightMap, groupBp: GroupBp): string[] {
  const violations: string[] = [];

  for (const [ticker, weight] of Object.entries(weights)) {
    if ((weight ?? 0) > MAX_SINGLE_HOLDING_WEIGHT) {
      violations.push(`${ticker} 비중이 단일 종목 상한을 초과했습니다.`);
    }
  }

  for (const group of ETF_GROUPS) {
    const weight = groupBp[group] / WEIGHT_BP_TOTAL;
    if (weight > 0 && weight < MIN_GROUP_WEIGHT) {
      violations.push(`${group} 그룹 비중이 최소 비중 미만입니다.`);
    }
  }

  if (sumWeights(weights) !== 1) violations.push('비중 합계가 100%가 아닙니다.');

  return violations;
}

function makeCandidate(
  stage: AllocationStage,
  selection: Selection,
  groupBp: GroupBp,
  shareBp: number,
  evaluate: AllocationEvaluator,
): Candidate | null {
  const weights = buildWeights(selection, groupBp);
  if (checkGuardrails(weights, groupBp).length > 0) return null;
  return { stage, weights, groupBp, shareBp, net: evaluate(weights) };
}

function toOutcome(chosen: Candidate, maxNetMonthlyUsd: number): AllocationOutcome {
  return {
    stage: chosen.stage,
    weights: chosen.weights,
    groupWeights: {
      sp500: chosen.groupBp.sp500 / WEIGHT_BP_TOTAL,
      nasdaq100: chosen.groupBp.nasdaq100 / WEIGHT_BP_TOTAL,
      bond: chosen.groupBp.bond / WEIGHT_BP_TOTAL,
    },
    nasdaqShareOfEquity: chosen.shareBp / WEIGHT_BP_TOTAL,
    netMonthlyUsd: chosen.net,
    maxNetMonthlyUsd,
  };
}

export interface AllocateParams {
  bondRatio: number;
  quotes: QuoteMap;
  targetMonthlyNetUsd: number;
  evaluate: AllocationEvaluator;
}

export function allocateAuto(params: AllocateParams): AllocationOutcome {
  const { bondRatio, quotes, targetMonthlyNetUsd, evaluate } = params;
  const bondBp = Math.round(bondRatio * WEIGHT_BP_TOTAL);

  const ranked = ETF_GROUPS.reduce((acc, group) => {
    acc[group] = rankByYield(tickersInGroup(group), quotes);
    return acc;
  }, {} as Selection);
  const compressed = ETF_GROUPS.reduce((acc, group) => {
    acc[group] = ranked[group].slice(0, TOP_HOLDINGS_PER_GROUP);
    return acc;
  }, {} as Selection);

  const seen: Candidate[] = [];
  const track = (candidate: Candidate | null): Candidate | null => {
    if (candidate) seen.push(candidate);
    return candidate;
  };

  const startBp = EQUITY_NASDAQ_SHARE_START_BP;
  const equal = track(makeCandidate('STEP3', ranked, groupBpFor(bondBp, startBp), startBp, evaluate));
  if (equal && equal.net >= targetMonthlyNetUsd) return toOutcome(equal, equal.net);

  const top2 = track(makeCandidate('STEP4', compressed, groupBpFor(bondBp, startBp), startBp, evaluate));
  if (top2 && top2.net >= targetMonthlyNetUsd) return toOutcome(top2, top2.net);

  for (
    let shareBp = startBp + EQUITY_SHIFT_STEP_BP;
    shareBp <= EQUITY_NASDAQ_SHARE_MAX_BP;
    shareBp += EQUITY_SHIFT_STEP_BP
  ) {
    const shifted = track(makeCandidate('STEP5', compressed, groupBpFor(bondBp, shareBp), shareBp, evaluate));
    if (shifted && shifted.net >= targetMonthlyNetUsd) return toOutcome(shifted, shifted.net);
  }

  if (seen.length === 0) {
    throw new Error('가드레일을 만족하는 배분안이 없습니다. 채권 비중을 확인하세요.');
  }
  const best = seen.reduce((left, right) => (right.net > left.net ? right : left));
  return toOutcome({ ...best, stage: 'STEP6' }, best.net);
}

export function allocateManual(holdings: readonly ManualHolding[]): WeightMap {
  const weights: WeightMap = {};
  for (const holding of holdings) {
    weights[holding.ticker as Ticker] = holding.weight;
  }
  return weights;
}
