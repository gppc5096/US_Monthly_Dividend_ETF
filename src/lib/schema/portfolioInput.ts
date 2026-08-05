import { z } from 'zod';

import {
  BOND_RATIO_MAX,
  BOND_RATIO_MIN,
  MAX_DISPLAY_CURRENCIES,
  MIN_GROUP_WEIGHT,
  WEIGHT_DECIMALS,
} from '@/lib/data/constants';
import { COUNTRY_CODES, CURRENCY_CODES } from '@/lib/data/countries';
import { TICKERS } from '@/lib/data/etfs';
import { ETF_GROUPS } from '@/lib/types/etf';

const roundWeight = (value: number) => Number(value.toFixed(WEIGHT_DECIMALS));

export const currencyCodeSchema = z.enum(CURRENCY_CODES);
export const countryCodeSchema = z.enum(COUNTRY_CODES);
export const tickerSchema = z.enum(TICKERS as [string, ...string[]]);
export const etfGroupSchema = z.enum(ETF_GROUPS);

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: currencyCodeSchema,
});

export const taxSettingsSchema = z.object({
  usWithholdingRate: z.number().min(0).max(1),
  residentTaxRate: z.number().min(0).max(1),
  creditForeignTax: z.boolean(),
});

export const fxRatesSchema = z.partialRecord(currencyCodeSchema, z.number().positive());

export const manualHoldingSchema = z.object({
  ticker: tickerSchema,
  weight: z.number().min(0).max(1),
});

export const portfolioInputSchema = z
  .object({
    mode: z.enum(['auto', 'manual']),
    principal: moneySchema,
    targetMonthlyNet: moneySchema,
    residenceCountry: countryCodeSchema,
    displayCurrencies: z.array(currencyCodeSchema).min(1).max(MAX_DISPLAY_CURRENCIES),
    tax: taxSettingsSchema,
    fxRates: fxRatesSchema,
    bondRatio: z.number().min(BOND_RATIO_MIN).max(BOND_RATIO_MAX).optional(),
    manualHoldings: z.array(manualHoldingSchema).min(1).optional(),
  })
  .superRefine((input, ctx) => {
    if (new Set(input.displayCurrencies).size !== input.displayCurrencies.length) {
      ctx.addIssue({ code: 'custom', path: ['displayCurrencies'], message: '표시 통화가 중복되었습니다.' });
    }

    if (input.mode === 'auto') {
      if (input.bondRatio === undefined) {
        ctx.addIssue({ code: 'custom', path: ['bondRatio'], message: '자동 모드에서는 채권 비중이 필요합니다.' });
        return;
      }
      if (input.bondRatio > 0 && input.bondRatio < MIN_GROUP_WEIGHT) {
        ctx.addIssue({
          code: 'custom',
          path: ['bondRatio'],
          message: `채권 비중은 0% 이거나 ${MIN_GROUP_WEIGHT * 100}% 이상이어야 합니다.`,
        });
      }
      return;
    }

    const holdings = input.manualHoldings;
    if (!holdings || holdings.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['manualHoldings'], message: '수동 모드에서는 종목을 1개 이상 선택해야 합니다.' });
      return;
    }
    if (new Set(holdings.map((h) => h.ticker)).size !== holdings.length) {
      ctx.addIssue({ code: 'custom', path: ['manualHoldings'], message: '같은 종목을 두 번 선택할 수 없습니다.' });
    }
    const sum = roundWeight(holdings.reduce((acc, h) => acc + h.weight, 0));
    if (sum !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['manualHoldings'],
        message: `비중 합계가 100%가 아닙니다 (현재 ${roundWeight(sum * 100)}%).`,
      });
    }
  });

export type PortfolioInput = z.infer<typeof portfolioInputSchema>;
export type Money = z.infer<typeof moneySchema>;
export type TaxSettings = z.infer<typeof taxSettingsSchema>;
export type FxRates = z.infer<typeof fxRatesSchema>;
export type ManualHolding = z.infer<typeof manualHoldingSchema>;

export const moneyByPeriodSchema = z.object({
  annualUsd: z.number(),
  monthlyUsd: z.number(),
});

export const holdingResultSchema = z.object({
  ticker: tickerSchema,
  name: z.string(),
  group: etfGroupSchema,
  weight: z.number(),
  amountUsd: z.number(),
  annualYield: z.number(),
  annualGrossUsd: z.number(),
  annualNetUsd: z.number(),
  usWithheldUsd: z.number(),
  residentTaxUsd: z.number(),
  withholdingExempt: z.boolean(),
});

export const taxDetailSchema = z.object({
  usWithheld: z.number(),
  residentTax: z.number(),
  effectiveRate: z.number(),
});

export const currencyRowSchema = z.object({
  currency: currencyCodeSchema,
  rate: z.number(),
  annualGross: z.number(),
  annualNet: z.number(),
  monthlyGross: z.number(),
  monthlyNet: z.number(),
});

export const feasibilityResultSchema = z.object({
  achievable: z.boolean(),
  monthlyNetUsd: z.number(),
  targetMonthlyNetUsd: z.number(),
  attainmentRate: z.number(),
  maxMonthlyNetUsd: z.number(),
  requiredPrincipalUsd: z.number(),
  suggestedBondRatio: z.number().nullable(),
  suggestion: z.string().nullable(),
});

export const allocationSummarySchema = z.object({
  stage: z.enum(['STEP3', 'STEP4', 'STEP5', 'STEP6', 'MANUAL']),
  bondRatio: z.number(),
  nasdaqShareOfEquity: z.number(),
  groupWeights: z.record(etfGroupSchema, z.number()),
});

export const portfolioResultSchema = z.object({
  holdings: z.array(holdingResultSchema),
  gross: moneyByPeriodSchema,
  net: moneyByPeriodSchema,
  taxDetail: taxDetailSchema,
  byCurrency: z.array(currencyRowSchema),
  feasibility: feasibilityResultSchema,
  allocation: allocationSummarySchema,
  meta: z.object({ asOf: z.string(), isFallback: z.boolean() }),
});

export type MoneyByPeriod = z.infer<typeof moneyByPeriodSchema>;
export type HoldingResult = z.infer<typeof holdingResultSchema>;
export type TaxDetail = z.infer<typeof taxDetailSchema>;
export type CurrencyRow = z.infer<typeof currencyRowSchema>;
export type FeasibilityResult = z.infer<typeof feasibilityResultSchema>;
export type AllocationSummary = z.infer<typeof allocationSummarySchema>;
export type PortfolioResult = z.infer<typeof portfolioResultSchema>;
