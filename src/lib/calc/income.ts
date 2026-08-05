import { computeHoldingTax, computeTax, type DividendItem } from '@/lib/calc/tax';
import { toMonthly } from '@/lib/calc/currency';
import { ETFS, etfByTicker, type Ticker } from '@/lib/data/etfs';
import type { HoldingResult, MoneyByPeriod, TaxDetail, TaxSettings } from '@/lib/schema/portfolioInput';
import type { QuoteMap } from '@/lib/types/etf';
import type { AllocationEvaluator, WeightMap } from '@/lib/types/result';

export function resolveYield(ticker: string, quotes: QuoteMap): number {
  const live = quotes[ticker]?.yield;
  if (typeof live === 'number' && Number.isFinite(live)) return live;
  const master = etfByTicker(ticker);
  if (!master) throw new Error(`알 수 없는 종목입니다: ${ticker}`);
  return master.fallbackYield;
}

export function buildHoldings(
  weights: WeightMap,
  principalUsd: number,
  quotes: QuoteMap,
  tax: TaxSettings,
): HoldingResult[] {
  return ETFS.filter((etf) => (weights[etf.ticker] ?? 0) > 0).map((etf) => {
    const weight = weights[etf.ticker] as number;
    const amountUsd = principalUsd * weight;
    const annualYield = resolveYield(etf.ticker, quotes);
    const annualGrossUsd = amountUsd * annualYield;
    const holdingTax = computeHoldingTax(
      { annualGrossUsd, withholdingExempt: etf.withholdingExempt },
      tax,
    );

    return {
      ticker: etf.ticker as Ticker,
      name: etf.name,
      group: etf.group,
      weight,
      amountUsd,
      annualYield,
      annualGrossUsd,
      annualNetUsd: holdingTax.annualNetUsd,
      usWithheldUsd: holdingTax.usWithheldUsd,
      residentTaxUsd: holdingTax.residentTaxUsd,
      withholdingExempt: etf.withholdingExempt,
    };
  });
}

export interface IncomeSummary {
  gross: MoneyByPeriod;
  net: MoneyByPeriod;
  taxDetail: TaxDetail;
}

export function summarizeIncome(holdings: readonly HoldingResult[], tax: TaxSettings): IncomeSummary {
  const items: DividendItem[] = holdings.map((holding) => ({
    annualGrossUsd: holding.annualGrossUsd,
    withholdingExempt: holding.withholdingExempt,
  }));
  const summary = computeTax(items, tax);

  return {
    gross: toMonthly(summary.grossUsd),
    net: toMonthly(summary.netUsd),
    taxDetail: {
      usWithheld: summary.usWithheld,
      residentTax: summary.residentTax,
      effectiveRate: summary.effectiveRate,
    },
  };
}

export function makeEvaluator(
  principalUsd: number,
  quotes: QuoteMap,
  tax: TaxSettings,
): AllocationEvaluator {
  return (weights) =>
    summarizeIncome(buildHoldings(weights, principalUsd, quotes, tax), tax).net.monthlyUsd;
}
