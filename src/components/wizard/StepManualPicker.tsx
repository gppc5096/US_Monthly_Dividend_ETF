'use client';

import { useMemo } from 'react';

import { ManualHoldingRow } from '@/components/wizard/ManualHoldingRow';
import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import { ETFS } from '@/lib/data/etfs';
import { formatPercent } from '@/lib/format/percentFormat';
import { ETF_GROUPS, ETF_GROUP_LABELS } from '@/lib/types/etf';
import { cn } from '@/lib/utils';
import { selectManualWeightSum } from '@/store/wizardSelectors';
import { useWizardStore } from '@/store/wizardStore';

const GROUPED = ETF_GROUPS.map((group) => ({
  group,
  label: ETF_GROUP_LABELS[group],
  etfs: ETFS.filter((etf) => etf.group === group),
}));

export function StepManualPicker() {
  const manualHoldings = useWizardStore((state) => state.manualHoldings);
  const toggleHolding = useWizardStore((state) => state.toggleHolding);
  const setHoldingWeight = useWizardStore((state) => state.setHoldingWeight);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);

  const weightByTicker = useMemo(
    () => new Map(manualHoldings.map((holding) => [holding.ticker, holding.weight])),
    [manualHoldings],
  );
  const sum = useWizardStore(selectManualWeightSum);
  const isExact = sum === 1;

  return (
    <StepFrame
      index={5}
      eyebrow="수동 선택"
      title="종목과 비중을 직접 정하세요."
      hint="종목을 누르면 선택되고 비중 칸이 열립니다. 합계가 정확히 100%여야 계산할 수 있습니다."
    >
      <div className="flex flex-col gap-4">
        {GROUPED.map(({ group, label, etfs }) => (
          <div key={group} className="overflow-hidden rounded-lg border border-rule bg-card">
            <div className="border-b border-rule bg-muted/50 px-3 py-2">
              <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {label}
              </span>
            </div>
            {etfs.map((etf) => (
              <ManualHoldingRow
                key={etf.ticker}
                etf={etf}
                weight={weightByTicker.get(etf.ticker) ?? null}
                onToggle={() => toggleHolding(etf.ticker)}
                onWeightChange={(weight) => setHoldingWeight(etf.ticker, weight)}
              />
            ))}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'pointer-events-none sticky bottom-24 flex items-center justify-between rounded-lg border px-4 py-3 backdrop-blur transition-colors md:bottom-4',
          isExact ? 'border-brand/50 bg-brand/10' : 'border-warn/50 bg-warn/10',
        )}
        aria-live="polite"
      >
        <span className="text-xs tracking-[0.16em] uppercase">비중 합계</span>
        <span
          className={cn('tnum font-mono text-xl font-semibold', isExact ? 'text-brand' : 'text-warn')}
        >
          {formatPercent(sum, 2)}
        </span>
      </div>

      <WizardNav
        onBack={goBack}
        onNext={() => confirmStep(5)}
        nextLabel="계산하기"
        nextDisabled={!isExact}
        helper={isExact ? undefined : '합계가 100%가 되도록 비중을 조정하세요.'}
      />
    </StepFrame>
  );
}
