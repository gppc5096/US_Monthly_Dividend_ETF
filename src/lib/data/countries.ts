export const CURRENCY_CODES = [
  'USD',
  'EUR',
  'JPY',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'NZD',
  'SGD',
  'MXN',
  'INR',
  'RUB',
  'GEL',
  'BRL',
  'TWD',
  'THB',
  'TRY',
  'PHP',
  'KRW',
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface Country {
  code: string;
  name: string;
  currency: CurrencyCode;
  symbol: string;
}

export const COUNTRIES = [
  { code: 'KR', name: '대한민국', currency: 'KRW', symbol: '₩' },
  { code: 'US', name: '미국', currency: 'USD', symbol: '$' },
  { code: 'DE', name: '독일', currency: 'EUR', symbol: '€' },
  { code: 'JP', name: '일본', currency: 'JPY', symbol: '¥' },
  { code: 'GB', name: '영국', currency: 'GBP', symbol: '£' },
  { code: 'AU', name: '호주', currency: 'AUD', symbol: 'A$' },
  { code: 'CA', name: '캐나다', currency: 'CAD', symbol: 'C$' },
  { code: 'CH', name: '스위스', currency: 'CHF', symbol: 'CHF' },
  { code: 'NZ', name: '뉴질랜드', currency: 'NZD', symbol: 'NZ$' },
  { code: 'SG', name: '싱가포르', currency: 'SGD', symbol: 'S$' },
  { code: 'MX', name: '멕시코', currency: 'MXN', symbol: 'MX$' },
  { code: 'IN', name: '인도', currency: 'INR', symbol: '₹' },
  { code: 'RU', name: '러시아', currency: 'RUB', symbol: '₽' },
  { code: 'GE', name: '조지아', currency: 'GEL', symbol: '₾' },
  { code: 'BR', name: '브라질', currency: 'BRL', symbol: 'R$' },
  { code: 'TW', name: '대만', currency: 'TWD', symbol: 'NT$' },
  { code: 'TH', name: '태국', currency: 'THB', symbol: '฿' },
  { code: 'TR', name: '튀르키예', currency: 'TRY', symbol: '₺' },
  { code: 'PH', name: '필리핀', currency: 'PHP', symbol: '₱' },
] as const satisfies readonly Country[];

export type CountryCode = (typeof COUNTRIES)[number]['code'];

export const COUNTRY_CODES = COUNTRIES.map((country) => country.code) as [CountryCode, ...CountryCode[]];

export const BASE_CURRENCY: CurrencyCode = 'USD';

/** KRW and USD are always shown; the user picks at most one more. */
export const FIXED_DISPLAY_CURRENCIES: CurrencyCode[] = ['KRW', 'USD'];

export function countryByCode(code: string): Country | undefined {
  return COUNTRIES.find((country) => country.code === code);
}

export function currencyOfCountry(code: string): CurrencyCode | undefined {
  return countryByCode(code)?.currency;
}
