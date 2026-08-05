import { WEIGHT_DECIMALS } from '@/lib/data/constants';
import { countryByCode, FIXED_DISPLAY_CURRENCIES, type CurrencyCode } from '@/lib/data/countries';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import { portfolioInputSchema, type PortfolioInput } from '@/lib/schema/portfolioInput';
import { PREVIEW_STEP, type WizardState } from '@/store/wizardStore';

export interface StatusItem {
  step: number;
  label: string;
  value: string;
}

export function displayCurrenciesOf(extraCurrency: CurrencyCode | null): CurrencyCode[] {
  const currencies = [...FIXED_DISPLAY_CURRENCIES];
  if (extraCurrency && !currencies.includes(extraCurrency)) currencies.push(extraCurrency);
  return currencies;
}

export function selectDisplayCurrencies(state: WizardState): CurrencyCode[] {
  return displayCurrenciesOf(state.extraCurrency);
}

export function selectProgressRatio(state: WizardState): number {
  return Math.min(state.step, PREVIEW_STEP) / PREVIEW_STEP;
}

export function selectManualWeightSum(state: WizardState): number {
  const sum = state.manualHoldings.reduce((total, holding) => total + holding.weight, 0);
  return Number(sum.toFixed(WEIGHT_DECIMALS));
}

export function selectPortfolioInput(state: WizardState): PortfolioInput | null {
  if (!state.mode) return null;
  const parsed = portfolioInputSchema.safeParse({
    mode: state.mode,
    principal: state.principal,
    targetMonthlyNet: state.targetMonthlyNet,
    residenceCountry: state.residenceCountry,
    displayCurrencies: selectDisplayCurrencies(state),
    tax: state.tax,
    fxRates: state.fxRates,
    bondRatio: state.mode === 'auto' ? state.bondRatio : undefined,
    manualHoldings: state.mode === 'manual' ? state.manualHoldings : undefined,
  });
  return parsed.success ? parsed.data : null;
}

function holdingsSummary(state: WizardState): string {
  if (state.manualHoldings.length === 0) return '미선택';
  return state.manualHoldings
    .map((holding) => `${holding.ticker} ${formatPercent(holding.weight, 1)}`)
    .join(' · ');
}

const STEP_BUILDERS: Record<number, (state: WizardState) => StatusItem | null> = {
  0: (state) =>
    state.mode
      ? { step: 0, label: '배분 모드', value: state.mode === 'auto' ? '자동 배분' : '수동 선택' }
      : null,
  1: (state) => ({
    step: 1,
    label: '총 투자금',
    value: formatMoney(state.principal.amount, state.principal.currency),
  }),
  2: (state) => ({
    step: 2,
    label: '목표 월 세후',
    value: formatMoney(state.targetMonthlyNet.amount, state.targetMonthlyNet.currency),
  }),
  3: (state) => ({
    step: 3,
    label: '거주국 · 통화',
    value: `${countryByCode(state.residenceCountry)?.name ?? state.residenceCountry} · ${selectDisplayCurrencies(state).join('/')}`,
  }),
  4: (state) => ({
    step: 4,
    label: '세율',
    value: `미국 ${formatPercent(state.tax.usWithholdingRate)} · 거주국 ${formatPercent(state.tax.residentTaxRate)}${state.tax.creditForeignTax ? ' · 공제' : ''}`,
  }),
  5: (state) =>
    state.mode === 'auto'
      ? { step: 5, label: '채권 비중', value: formatPercent(state.bondRatio, 0) }
      : { step: 5, label: '보유 종목', value: holdingsSummary(state) },
};

export function selectStatusItems(state: WizardState): StatusItem[] {
  return state.confirmedSteps
    .map((step) => STEP_BUILDERS[step]?.(state) ?? null)
    .filter((item): item is StatusItem => item !== null);
}
