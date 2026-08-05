import type { TaxDetail, TaxSettings } from '@/lib/schema/portfolioInput';

export interface DividendItem {
  annualGrossUsd: number;
  withholdingExempt: boolean;
}

export interface HoldingTax {
  usWithheldUsd: number;
  residentTaxUsd: number;
  annualNetUsd: number;
}

export function computeHoldingTax(item: DividendItem, tax: TaxSettings): HoldingTax {
  const gross = item.annualGrossUsd;
  const usWithheldUsd = item.withholdingExempt ? 0 : gross * tax.usWithholdingRate;
  const residentGross = gross * tax.residentTaxRate;
  const residentTaxUsd = tax.creditForeignTax
    ? Math.max(0, residentGross - usWithheldUsd)
    : residentGross;

  return {
    usWithheldUsd,
    residentTaxUsd,
    annualNetUsd: gross - usWithheldUsd - residentTaxUsd,
  };
}

export interface TaxSummary extends TaxDetail {
  grossUsd: number;
  netUsd: number;
}

export function computeTax(items: readonly DividendItem[], tax: TaxSettings): TaxSummary {
  let grossUsd = 0;
  let usWithheld = 0;
  let residentTax = 0;

  for (const item of items) {
    const holdingTax = computeHoldingTax(item, tax);
    grossUsd += item.annualGrossUsd;
    usWithheld += holdingTax.usWithheldUsd;
    residentTax += holdingTax.residentTaxUsd;
  }

  const totalTax = usWithheld + residentTax;

  return {
    grossUsd,
    netUsd: grossUsd - totalTax,
    usWithheld,
    residentTax,
    effectiveRate: grossUsd === 0 ? 0 : totalTax / grossUsd,
  };
}
