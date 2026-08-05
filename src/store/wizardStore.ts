'use client';

import { create } from 'zustand';

import { BOND_RATIO_DEFAULT, US_WITHHOLDING_RATE } from '@/lib/data/constants';
import type { CountryCode, CurrencyCode } from '@/lib/data/countries';
import { currencyOfCountry, FIXED_DISPLAY_CURRENCIES } from '@/lib/data/countries';
import { FALLBACK_FX_RATES } from '@/lib/data/fallbackQuotes';
import { taxPresetOf } from '@/lib/data/taxPresets';
import type { FxRates, ManualHolding, Money, TaxSettings } from '@/lib/schema/portfolioInput';

export const FIRST_STEP = 0;
export const LAST_INPUT_STEP = 5;
export const PREVIEW_STEP = 6;

const DEFAULT_COUNTRY: CountryCode = 'KR';
const DEFAULT_CURRENCY: CurrencyCode = 'KRW';

export interface WizardState {
  step: number;
  mode: 'auto' | 'manual' | null;
  principal: Money;
  targetMonthlyNet: Money;
  residenceCountry: CountryCode;
  extraCurrency: CurrencyCode | null;
  tax: TaxSettings;
  fxRates: FxRates;
  /** Currencies whose rate the user typed in — never overwritten by /api/fx. */
  fxOverrides: CurrencyCode[];
  bondRatio: number;
  manualHoldings: ManualHolding[];
  confirmedSteps: number[];

  setMode: (mode: 'auto' | 'manual') => void;
  setPrincipal: (money: Money) => void;
  setTargetMonthlyNet: (money: Money) => void;
  setResidenceCountry: (country: CountryCode) => void;
  setExtraCurrency: (currency: CurrencyCode | null) => void;
  setTax: (patch: Partial<TaxSettings>) => void;
  setFxRate: (currency: CurrencyCode, rate: number) => void;
  resetFxRate: (currency: CurrencyCode) => void;
  applyFxSnapshot: (rates: FxRates) => void;
  setBondRatio: (ratio: number) => void;
  toggleHolding: (ticker: string) => void;
  setHoldingWeight: (ticker: string, weight: number) => void;
  confirmStep: (step: number) => void;
  goToStep: (step: number) => void;
  goBack: () => void;
  reset: () => void;
}

function initialState() {
  const preset = taxPresetOf(DEFAULT_COUNTRY);
  return {
    step: FIRST_STEP,
    mode: null,
    principal: { amount: 0, currency: DEFAULT_CURRENCY },
    targetMonthlyNet: { amount: 0, currency: DEFAULT_CURRENCY },
    residenceCountry: DEFAULT_COUNTRY,
    extraCurrency: null,
    tax: {
      usWithholdingRate: US_WITHHOLDING_RATE,
      residentTaxRate: preset.residentTaxRate,
      creditForeignTax: preset.creditForeignTax,
    },
    fxRates: { ...FALLBACK_FX_RATES } as FxRates,
    fxOverrides: [],
    bondRatio: BOND_RATIO_DEFAULT,
    manualHoldings: [],
    confirmedSteps: [],
  } satisfies Omit<WizardState, keyof WizardActions>;
}

type WizardActions = Pick<
  WizardState,
  | 'setMode'
  | 'setPrincipal'
  | 'setTargetMonthlyNet'
  | 'setResidenceCountry'
  | 'setExtraCurrency'
  | 'setTax'
  | 'setFxRate'
  | 'resetFxRate'
  | 'applyFxSnapshot'
  | 'setBondRatio'
  | 'toggleHolding'
  | 'setHoldingWeight'
  | 'confirmStep'
  | 'goToStep'
  | 'goBack'
  | 'reset'
>;

const withStep = (steps: number[], step: number) =>
  steps.includes(step) ? steps : [...steps, step].sort((a, b) => a - b);

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState(),

  setMode: (mode) => set({ mode }),
  setPrincipal: (principal) => set({ principal }),
  setTargetMonthlyNet: (targetMonthlyNet) => set({ targetMonthlyNet }),

  setResidenceCountry: (residenceCountry) => {
    const preset = taxPresetOf(residenceCountry);
    const currency = currencyOfCountry(residenceCountry);
    set((state) => ({
      residenceCountry,
      extraCurrency:
        currency && !FIXED_DISPLAY_CURRENCIES.includes(currency) ? currency : state.extraCurrency,
      tax: {
        usWithholdingRate: state.tax.usWithholdingRate,
        residentTaxRate: preset.residentTaxRate,
        creditForeignTax: preset.creditForeignTax,
      },
    }));
  },

  setExtraCurrency: (extraCurrency) => set({ extraCurrency }),
  setTax: (patch) => set((state) => ({ tax: { ...state.tax, ...patch } })),

  setFxRate: (currency, rate) =>
    set((state) => ({
      fxRates: { ...state.fxRates, [currency]: rate },
      fxOverrides: state.fxOverrides.includes(currency)
        ? state.fxOverrides
        : [...state.fxOverrides, currency],
    })),

  resetFxRate: (currency) =>
    set((state) => ({
      fxRates: { ...state.fxRates, [currency]: FALLBACK_FX_RATES[currency] },
      fxOverrides: state.fxOverrides.filter((code) => code !== currency),
    })),

  applyFxSnapshot: (rates) =>
    set((state) => {
      const merged: FxRates = { ...state.fxRates };
      for (const [code, rate] of Object.entries(rates)) {
        const currency = code as CurrencyCode;
        if (rate !== undefined && !state.fxOverrides.includes(currency)) merged[currency] = rate;
      }
      return { fxRates: merged };
    }),

  setBondRatio: (bondRatio) => set({ bondRatio }),

  toggleHolding: (ticker) =>
    set((state) => {
      const exists = state.manualHoldings.some((holding) => holding.ticker === ticker);
      return {
        manualHoldings: exists
          ? state.manualHoldings.filter((holding) => holding.ticker !== ticker)
          : [...state.manualHoldings, { ticker, weight: 0 }],
      };
    }),

  setHoldingWeight: (ticker, weight) =>
    set((state) => ({
      manualHoldings: state.manualHoldings.map((holding) =>
        holding.ticker === ticker ? { ...holding, weight } : holding,
      ),
    })),

  confirmStep: (step) =>
    set((state) => ({
      confirmedSteps: withStep(state.confirmedSteps, step),
      step: step + 1,
    })),

  goToStep: (step) => set({ step }),
  goBack: () => set((state) => ({ step: Math.max(FIRST_STEP, state.step - 1) })),
  reset: () => set(initialState()),
}));
