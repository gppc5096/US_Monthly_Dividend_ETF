import { MONTHS_PER_YEAR } from '@/lib/data/constants';
import { BASE_CURRENCY, type CurrencyCode } from '@/lib/data/countries';
import type { FxRates, MoneyByPeriod } from '@/lib/schema/portfolioInput';
import type { CurrencyRow } from '@/lib/types/result';

export function rateOf(currency: CurrencyCode, fxRates: FxRates): number {
  if (currency === BASE_CURRENCY) return 1;
  const rate = fxRates[currency];
  if (rate === undefined || rate <= 0) {
    throw new Error(`환율이 없습니다: ${currency}`);
  }
  return rate;
}

export function fromUsd(amountUsd: number, currency: CurrencyCode, fxRates: FxRates): number {
  return amountUsd * rateOf(currency, fxRates);
}

export function toUsd(amount: number, currency: CurrencyCode, fxRates: FxRates): number {
  return amount / rateOf(currency, fxRates);
}

export function toMonthly(annualUsd: number): MoneyByPeriod {
  return { annualUsd, monthlyUsd: annualUsd / MONTHS_PER_YEAR };
}

export function buildCurrencyRows(
  gross: MoneyByPeriod,
  net: MoneyByPeriod,
  currencies: readonly CurrencyCode[],
  fxRates: FxRates,
): CurrencyRow[] {
  return currencies.map((currency) => {
    const rate = rateOf(currency, fxRates);
    return {
      currency,
      rate,
      annualGross: gross.annualUsd * rate,
      annualNet: net.annualUsd * rate,
      monthlyGross: gross.monthlyUsd * rate,
      monthlyNet: net.monthlyUsd * rate,
    };
  });
}
