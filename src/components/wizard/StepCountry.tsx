'use client';

import { LockIcon } from 'lucide-react';

import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, countryByCode, type CountryCode } from '@/lib/data/countries';
import { taxPresetOf } from '@/lib/data/taxPresets';
import { formatPercent } from '@/lib/format/percentFormat';
import { useWizardStore } from '@/store/wizardStore';

const FIXED_ROWS = [
  { code: 'KR', reason: '원화 기준 표기' },
  { code: 'US', reason: '배당 원천징수 기준' },
] as const;

export function StepCountry() {
  const residenceCountry = useWizardStore((state) => state.residenceCountry);
  const setResidenceCountry = useWizardStore((state) => state.setResidenceCountry);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);

  const preset = taxPresetOf(residenceCountry);
  const selected = countryByCode(residenceCountry);

  return (
    <StepFrame
      index={3}
      eyebrow="거주국 · 통화"
      title="어느 나라 기준으로 세금을 계산할까요?"
      hint="한국 원화와 미국 달러는 항상 함께 표기되고, 선택한 거주국 통화가 한 줄 더 붙습니다."
    >
      <div className="overflow-hidden rounded-lg border border-rule bg-card">
        {FIXED_ROWS.map((row) => {
          const country = countryByCode(row.code);
          return (
            <div
              key={row.code}
              className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <LockIcon className="size-3.5 text-muted-foreground" aria-hidden />
                <span className="text-sm font-medium">{country?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{row.reason}</span>
                <span className="tnum font-mono text-sm text-brand">{country?.currency}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <label
          htmlFor="residence-country"
          className="text-xs tracking-[0.16em] text-muted-foreground uppercase"
        >
          거주국 선택
        </label>
        <Select
          value={residenceCountry}
          onValueChange={(next) => setResidenceCountry(next as CountryCode)}
        >
          <SelectTrigger id="residence-country" className="h-12 w-full rounded-md px-4 text-base">
            <SelectValue>
              {(value: string) => countryByCode(value)?.name ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code} className="py-2">
                <span className="flex w-full items-center justify-between gap-6">
                  <span>{country.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {country.currency}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="rounded-lg border border-brand/30 bg-brand/5 px-4 py-3">
          <p className="text-xs tracking-[0.16em] text-brand uppercase">세율 프리셋</p>
          <p className="tnum mt-1.5 text-sm">
            {selected?.name} 거주자 배당소득세{' '}
            <strong className="font-mono font-semibold">
              {formatPercent(preset.residentTaxRate)}
            </strong>
            {preset.creditForeignTax ? ' · 외국납부세액공제 적용' : ' · 해외소득 분리/비과세'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{preset.note}</p>
        </div>
      </div>

      <WizardNav onBack={goBack} onNext={() => confirmStep(3)} />
    </StepFrame>
  );
}
