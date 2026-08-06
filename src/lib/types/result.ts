import type { CurrencyCode } from '@/lib/data/countries';
import type { Ticker } from '@/lib/data/etfs';
import type { EtfGroup } from '@/lib/types/etf';

export type {
  AllocationSummary,
  CurrencyRow,
  FeasibilityResult,
  HoldingResult,
  MoneyByPeriod,
  PortfolioResult,
  TaxDetail,
} from '@/lib/schema/portfolioInput';

export type WeightMap = Partial<Record<Ticker, number>>;

/** `FeasibilityResult` amounts restated in the screen's primary display currency. */
export interface FeasibilityDisplay {
  currency: CurrencyCode;
  monthlyNet: number;
  targetMonthlyNet: number;
  maxMonthlyNet: number;
  requiredPrincipal: number;
}

export type AllocationStage = 'STEP3' | 'STEP4' | 'STEP5' | 'STEP6';

export interface AllocationOutcome {
  stage: AllocationStage;
  weights: WeightMap;
  groupWeights: Record<EtfGroup, number>;
  nasdaqShareOfEquity: number;
  netMonthlyUsd: number;
  /** Best net monthly income seen across every candidate allocation. */
  maxNetMonthlyUsd: number;
}

/** Maps a candidate weight map to its net monthly income in USD. */
export type AllocationEvaluator = (weights: WeightMap) => number;
