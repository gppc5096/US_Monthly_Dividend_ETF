import { allocateAuto, allocateManual } from '@/lib/calc/allocate';
import { buildCurrencyRows, toUsd } from '@/lib/calc/currency';
import { buildFeasibility } from '@/lib/calc/feasibility';
import { buildHoldings, makeEvaluator, summarizeIncome } from '@/lib/calc/income';
import { BOND_RATIO_DEFAULT } from '@/lib/data/constants';
import { etfByTicker } from '@/lib/data/etfs';
import type { AllocationSummary, PortfolioInput, PortfolioResult } from '@/lib/schema/portfolioInput';
import type { EtfGroup, MarketSnapshot } from '@/lib/types/etf';
import type { AllocationEvaluator, WeightMap } from '@/lib/types/result';

export * from '@/lib/calc/allocate';
export * from '@/lib/calc/currency';
export * from '@/lib/calc/feasibility';
export * from '@/lib/calc/income';
export * from '@/lib/calc/tax';

function groupWeightsOf(weights: WeightMap): Record<EtfGroup, number> {
  const totals: Record<EtfGroup, number> = { sp500: 0, nasdaq100: 0, bond: 0 };
  for (const [ticker, weight] of Object.entries(weights)) {
    const etf = etfByTicker(ticker);
    if (etf) totals[etf.group] += weight ?? 0;
  }
  return totals;
}

interface Plan {
  weights: WeightMap;
  allocation: AllocationSummary;
  maxMonthlyNetUsd: number;
  bondRatio: number | null;
  probeBondRatio?: (bondRatio: number) => number;
}

function planAuto(
  input: PortfolioInput,
  quotes: MarketSnapshot['quotes'],
  targetMonthlyNetUsd: number,
  evaluate: AllocationEvaluator,
): Plan {
  const bondRatio = input.bondRatio ?? BOND_RATIO_DEFAULT;
  const outcome = allocateAuto({ bondRatio, quotes, targetMonthlyNetUsd, evaluate });

  return {
    weights: outcome.weights,
    allocation: {
      stage: outcome.stage,
      bondRatio,
      nasdaqShareOfEquity: outcome.nasdaqShareOfEquity,
      groupWeights: outcome.groupWeights,
    },
    maxMonthlyNetUsd: outcome.maxNetMonthlyUsd,
    bondRatio,
    probeBondRatio: (ratio) =>
      allocateAuto({ bondRatio: ratio, quotes, targetMonthlyNetUsd: Infinity, evaluate })
        .maxNetMonthlyUsd,
  };
}

function planManual(input: PortfolioInput, evaluate: AllocationEvaluator): Plan {
  const weights = allocateManual(input.manualHoldings ?? []);
  const groupWeights = groupWeightsOf(weights);
  const equity = groupWeights.sp500 + groupWeights.nasdaq100;

  return {
    weights,
    allocation: {
      stage: 'MANUAL',
      bondRatio: groupWeights.bond,
      nasdaqShareOfEquity: equity > 0 ? groupWeights.nasdaq100 / equity : 0,
      groupWeights,
    },
    maxMonthlyNetUsd: evaluate(weights),
    bondRatio: null,
  };
}

export function runPortfolio(input: PortfolioInput, market: MarketSnapshot): PortfolioResult {
  const { quotes, asOf, isFallback } = market;
  const principalUsd = toUsd(input.principal.amount, input.principal.currency, input.fxRates);
  const targetMonthlyNetUsd = toUsd(
    input.targetMonthlyNet.amount,
    input.targetMonthlyNet.currency,
    input.fxRates,
  );
  const evaluate = makeEvaluator(principalUsd, quotes, input.tax);

  const plan =
    input.mode === 'auto'
      ? planAuto(input, quotes, targetMonthlyNetUsd, evaluate)
      : planManual(input, evaluate);

  const holdings = buildHoldings(plan.weights, principalUsd, quotes, input.tax);
  const { gross, net, taxDetail } = summarizeIncome(holdings, input.tax);

  return {
    holdings,
    gross,
    net,
    taxDetail,
    byCurrency: buildCurrencyRows(gross, net, input.displayCurrencies, input.fxRates),
    feasibility: buildFeasibility({
      targetMonthlyNetUsd,
      monthlyNetUsd: net.monthlyUsd,
      maxMonthlyNetUsd: Math.max(plan.maxMonthlyNetUsd, net.monthlyUsd),
      principalUsd,
      bondRatio: plan.bondRatio,
      probeBondRatio: plan.probeBondRatio,
    }),
    allocation: plan.allocation,
    meta: { asOf, isFallback },
  };
}
