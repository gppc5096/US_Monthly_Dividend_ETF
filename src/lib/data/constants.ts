export const US_WITHHOLDING_RATE = 0.15;

export const QUOTES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const FX_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
export const COMMENTARY_TIMEOUT_MS = 20 * 1000;
export const MARKET_FETCH_TIMEOUT_MS = 8 * 1000;

/** External market APIs report yields as percentages; the calc engine uses ratios. */
export const PERCENT_DIVISOR = 100;

export const MONTHS_PER_YEAR = 12;

export const BOND_RATIO_DEFAULT = 0.2;
export const BOND_RATIO_MIN = 0;
export const BOND_RATIO_MAX = 0.5;
export const BOND_RATIO_SUGGEST_STEP = 0.05;

export const MAX_SINGLE_HOLDING_WEIGHT = 0.4;
export const MIN_GROUP_WEIGHT = 0.05;

/** Weights are held as integer basis points so group splits and 1%p shifts stay exact. */
export const WEIGHT_BP_TOTAL = 10_000;
export const WEIGHT_DECIMALS = 6;

export const TOP_HOLDINGS_PER_GROUP = 2;

/** STEP 5: nasdaq share of the equity sleeve, expressed in basis points. */
export const EQUITY_NASDAQ_SHARE_START_BP = 5_000;
export const EQUITY_NASDAQ_SHARE_MAX_BP = 7_000;
export const EQUITY_SHIFT_STEP_BP = 100;

export const MAX_DISPLAY_CURRENCIES = 3;

export const DISCLAIMER =
  '본 계산은 단순화된 모델이며 실제 세액은 거주 상태, 조세조약, 개인 소득 구간에 따라 달라집니다. ' +
  '세율은 직접 확인·수정하여 사용하시고, 실제 신고는 세무 전문가와 상담하십시오.';

/** PRD §15 — pinned to the footer on every screen. */
export const INVESTMENT_DISCLAIMER =
  '본 서비스는 정보 제공 및 계산 목적의 도구이며 투자 권유나 세무 자문이 아닙니다. ' +
  '표시된 배당수익률은 과거·현재 기준 참고값으로 미래 수익을 보장하지 않으며, ' +
  '커버드콜 상품은 원금 손실 가능성이 있습니다. 투자 판단과 세금 신고의 책임은 이용자 본인에게 있습니다.';
