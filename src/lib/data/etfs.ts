import type { EtfGroup, EtfMaster } from '@/lib/types/etf';

export const ETFS = [
  {
    ticker: 'SPYI',
    name: 'NEOS S&P 500 High Income ETF',
    group: 'sp500',
    fallbackYield: 0.11,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'JEPI',
    name: 'JPMorgan Equity Premium Income ETF',
    group: 'sp500',
    fallbackYield: 0.07,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'XYLD',
    name: 'Global X S&P 500 Covered Call ETF',
    group: 'sp500',
    fallbackYield: 0.09,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'IVVW',
    name: 'iShares S&P 500 Top 20 Covered Call ETF',
    group: 'sp500',
    fallbackYield: 0.1,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'QQQI',
    name: 'NEOS Nasdaq-100 High Income ETF',
    group: 'nasdaq100',
    fallbackYield: 0.14,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'JEPQ',
    name: 'JPMorgan Nasdaq Equity Premium Income ETF',
    group: 'nasdaq100',
    fallbackYield: 0.09,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'QYLD',
    name: 'Global X Nasdaq 100 Covered Call ETF',
    group: 'nasdaq100',
    fallbackYield: 0.11,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'QNTA',
    name: 'iShares Nasdaq 100 High Income ETF',
    group: 'nasdaq100',
    fallbackYield: 0.11,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'TLTW',
    name: 'iShares 20+ Year Treasury BuyWrite ETF',
    group: 'bond',
    fallbackYield: 0.13,
    taxType: 'dividend',
    withholdingExempt: false,
  },
  {
    ticker: 'SGOV',
    name: 'iShares 0-3 Month Treasury Bond ETF',
    group: 'bond',
    fallbackYield: 0.04,
    taxType: 'interest',
    withholdingExempt: true,
  },
] as const satisfies readonly EtfMaster[];

export type Ticker = (typeof ETFS)[number]['ticker'];

export const TICKERS = ETFS.map((etf) => etf.ticker) as Ticker[];

export function etfByTicker(ticker: string): EtfMaster | undefined {
  return ETFS.find((etf) => etf.ticker === ticker);
}

export function tickersInGroup(group: EtfGroup): Ticker[] {
  return ETFS.filter((etf) => etf.group === group).map((etf) => etf.ticker);
}

/** Option-income products whose 원금(NAV) can erode; SGOV is the only plain holding. */
const COVERED_CALL_TICKERS: readonly string[] = [
  'SPYI',
  'JEPI',
  'XYLD',
  'IVVW',
  'QQQI',
  'JEPQ',
  'QYLD',
  'QNTA',
  'TLTW',
] satisfies readonly Ticker[];

export function isCoveredCall(ticker: string): boolean {
  return COVERED_CALL_TICKERS.includes(ticker);
}
