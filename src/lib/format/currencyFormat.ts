import { COUNTRIES, type CurrencyCode } from '@/lib/data/countries';

const SYMBOLS = Object.fromEntries(
  COUNTRIES.map((country) => [country.currency, country.symbol]),
) as Record<CurrencyCode, string>;

/** Currencies whose smallest circulating unit is the whole unit. */
const WHOLE_UNIT_CURRENCIES: readonly CurrencyCode[] = ['KRW', 'JPY'];

export function currencySymbol(currency: CurrencyCode): string {
  return SYMBOLS[currency] ?? currency;
}

export function formatAmount(value: number, currency: CurrencyCode): string {
  const digits = WHOLE_UNIT_CURRENCIES.includes(currency) ? 0 : 2;
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatMoney(value: number, currency: CurrencyCode): string {
  return `${currencySymbol(currency)}${formatAmount(value, currency)}`;
}

/** Accepts grouped input like "1,250,000"; returns NaN when nothing numeric remains. */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  return cleaned === '' ? Number.NaN : Number(cleaned);
}

export function formatFxRate(rate: number): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: rate >= 100 ? 2 : 4,
  }).format(rate);
}
