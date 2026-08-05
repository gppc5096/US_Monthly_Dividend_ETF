'use client';

import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import { Slider } from '@/components/ui/slider';
import { BOND_RATIO_MAX, BOND_RATIO_MIN, MIN_GROUP_WEIGHT } from '@/lib/data/constants';
import { tickersInGroup } from '@/lib/data/etfs';
import {
  complementRatio,
  formatPercent,
  fromPercentValue,
  toPercentValue,
} from '@/lib/format/percentFormat';
import { useWizardStore } from '@/store/wizardStore';

const SLIDER_MIN = toPercentValue(BOND_RATIO_MIN);
const SLIDER_MAX = toPercentValue(BOND_RATIO_MAX);
const BOND_TICKERS = tickersInGroup('bond').join(' · ');

export function StepBondSlider() {
  const bondRatio = useWizardStore((state) => state.bondRatio);
  const setBondRatio = useWizardStore((state) => state.setBondRatio);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);

  const isBelowMinimum = bondRatio > 0 && bondRatio < MIN_GROUP_WEIGHT;

  return (
    <StepFrame
      index={5}
      eyebrow="자동 배분"
      title="채권 비중을 얼마로 둘까요?"
      hint="채권을 늘리면 흔들림이 줄고, 줄이면 배당이 늘어납니다. 나머지 주식 비중은 알고리즘이 목표에 맞춰 조정합니다."
    >
      <div className="rounded-lg border border-rule bg-card p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
              채권군 <span className="font-mono">{BOND_TICKERS}</span>
            </span>
            <span className="tnum font-mono text-5xl leading-none font-medium text-brand">
              {formatPercent(bondRatio, 0)}
            </span>
          </div>
          <span className="pb-1 text-sm text-muted-foreground">
            주식 <span className="tnum font-mono">{formatPercent(complementRatio(bondRatio), 0)}</span>
          </span>
        </div>

        <Slider
          aria-label="채권 비중"
          value={[toPercentValue(bondRatio)]}
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1}
          onValueChange={(value) =>
            setBondRatio(fromPercentValue(typeof value === 'number' ? value : value[0]))
          }
          className="mt-8 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-track]]:h-2"
        />

        <div className="mt-3 flex justify-between font-mono text-xs text-muted-foreground">
          <span>{SLIDER_MIN}%</span>
          <span>{SLIDER_MAX}%</span>
        </div>
      </div>

      <WizardNav
        onBack={goBack}
        onNext={() => confirmStep(5)}
        nextLabel="계산하기"
        nextDisabled={isBelowMinimum}
        helper={
          isBelowMinimum
            ? `채권 비중은 0% 이거나 ${formatPercent(MIN_GROUP_WEIGHT, 0)} 이상이어야 합니다.`
            : undefined
        }
      />
    </StepFrame>
  );
}
