'use client';

import { useMemo } from 'react';

import { FxRateRow } from '@/components/wizard/FxRateRow';
import { PercentField } from '@/components/wizard/PercentField';
import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import { Switch } from '@/components/ui/switch';
import { useFxRates } from '@/hooks/useFxRates';
import { DISCLAIMER } from '@/lib/data/constants';
import { BASE_CURRENCY } from '@/lib/data/countries';
import { displayCurrenciesOf } from '@/store/wizardSelectors';
import { useWizardStore } from '@/store/wizardStore';

export function StepTaxAndFx() {
  const tax = useWizardStore((state) => state.tax);
  const setTax = useWizardStore((state) => state.setTax);
  const fxRates = useWizardStore((state) => state.fxRates);
  const fxOverrides = useWizardStore((state) => state.fxOverrides);
  const extraCurrency = useWizardStore((state) => state.extraCurrency);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);
  const { snapshot, isLoading } = useFxRates();

  const currencies = useMemo(
    () => displayCurrenciesOf(extraCurrency).filter((code) => code !== BASE_CURRENCY),
    [extraCurrency],
  );

  return (
    <StepFrame
      index={4}
      eyebrow="세율 · 환율"
      title="세율과 환율을 확인해 주세요."
      hint="거주국 프리셋으로 미리 채워 두었습니다. 본인 상황에 맞게 고쳐서 쓰세요."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PercentField
          id="us-rate"
          label="미국 원천징수"
          value={tax.usWithholdingRate}
          onCommit={(next) => setTax({ usWithholdingRate: next })}
        />
        <PercentField
          id="resident-rate"
          label="거주국 세율"
          value={tax.residentTaxRate}
          onCommit={(next) => setTax({ residentTaxRate: next })}
        />
      </div>

      <label className="flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-4 rounded-lg border border-rule bg-card px-4 py-3">
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">외국납부세액공제 적용</span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            미국에서 낸 원천징수분을 거주국 세금에서 차감합니다.
          </span>
        </span>
        <Switch
          checked={tax.creditForeignTax}
          onCheckedChange={(checked) => setTax({ creditForeignTax: checked })}
        />
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            환율 (USD 기준)
          </span>
          <span className="text-xs text-muted-foreground">
            {isLoading ? '불러오는 중…' : snapshot.isFallback ? '참고값 · 연결 실패' : '자동 조회'}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-rule bg-card">
          {currencies.map((currency) => (
            <FxRateRow
              key={currency}
              currency={currency}
              rate={fxRates[currency] ?? 0}
              isManual={fxOverrides.includes(currency)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>

      <WizardNav onBack={goBack} onNext={() => confirmStep(4)} />
    </StepFrame>
  );
}
