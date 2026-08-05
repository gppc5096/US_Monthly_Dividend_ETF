import { US_WITHHOLDING_RATE } from '@/lib/data/constants';
import type { CountryCode } from '@/lib/data/countries';

export interface TaxPreset {
  residentTaxRate: number;
  /** true where the country lets you offset US withholding against local tax. */
  creditForeignTax: boolean;
  note: string;
}

export const TAX_PRESETS: Record<CountryCode, TaxPreset> = {
  KR: { residentTaxRate: 0.154, creditForeignTax: true, note: '배당소득세 15.4%(지방세 포함), 외국납부세액공제 적용' },
  US: { residentTaxRate: 0.15, creditForeignTax: true, note: '적격배당 장기세율 15% 가정' },
  DE: { residentTaxRate: 0.26375, creditForeignTax: true, note: '자본이득세 25% + 연대부가세' },
  JP: { residentTaxRate: 0.20315, creditForeignTax: true, note: '배당 원천분리과세 20.315%' },
  GB: { residentTaxRate: 0.0875, creditForeignTax: true, note: '배당 기본세율 8.75%' },
  AU: { residentTaxRate: 0.325, creditForeignTax: true, note: '한계세율 32.5% 구간 가정' },
  CA: { residentTaxRate: 0.2, creditForeignTax: true, note: '해외배당 일반소득 과세, 세율 구간별 상이' },
  CH: { residentTaxRate: 0.2, creditForeignTax: true, note: '연방·주 합산 추정치, 주별 편차 큼' },
  NZ: { residentTaxRate: 0.33, creditForeignTax: true, note: 'FIF 과세 별도 검토 필요' },
  SG: { residentTaxRate: 0, creditForeignTax: false, note: '해외원천 배당소득 비과세' },
  MX: { residentTaxRate: 0.1, creditForeignTax: true, note: '배당소득 10% 원천징수' },
  IN: { residentTaxRate: 0.2, creditForeignTax: true, note: '해외배당 일반소득 합산, 구간별 상이' },
  RU: { residentTaxRate: 0.13, creditForeignTax: true, note: '개인소득세 13%' },
  GE: { residentTaxRate: 0, creditForeignTax: false, note: '속지주의 — 해외원천 소득 비과세' },
  BR: { residentTaxRate: 0.15, creditForeignTax: true, note: '해외투자소득 15%' },
  TW: { residentTaxRate: 0.2, creditForeignTax: true, note: '기본소득세제(AMT) 20%, 공제한도 존재' },
  TH: { residentTaxRate: 0, creditForeignTax: false, note: '국내 송금분에 한해 과세 — 미송금 가정' },
  TR: { residentTaxRate: 0.2, creditForeignTax: true, note: '해외배당 신고 대상, 구간별 상이' },
  PH: { residentTaxRate: 0, creditForeignTax: false, note: '해외원천 소득 비과세(거주 외국인·비거주 국민 기준)' },
};

export const DEFAULT_TAX_PRESET: TaxPreset = TAX_PRESETS.KR;

export function taxPresetOf(country: CountryCode): TaxPreset {
  return TAX_PRESETS[country] ?? DEFAULT_TAX_PRESET;
}

export function defaultTaxInput(country: CountryCode) {
  const preset = taxPresetOf(country);
  return {
    usWithholdingRate: US_WITHHOLDING_RATE,
    residentTaxRate: preset.residentTaxRate,
    creditForeignTax: preset.creditForeignTax,
  };
}
