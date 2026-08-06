'use client';

import Link from 'next/link';

import { ResultSection } from '@/components/result/ResultSection';
import { StatusBox } from '@/components/status/StatusBox';
import { StepBondSlider } from '@/components/wizard/StepBondSlider';
import { StepCountry } from '@/components/wizard/StepCountry';
import { StepManualPicker } from '@/components/wizard/StepManualPicker';
import { StepModeSelect } from '@/components/wizard/StepModeSelect';
import { StepPrincipal } from '@/components/wizard/StepPrincipal';
import { StepTargetIncome } from '@/components/wizard/StepTargetIncome';
import { StepTaxAndFx } from '@/components/wizard/StepTaxAndFx';
import { useAnonUser } from '@/hooks/useAnonUser';
import { INVESTMENT_DISCLAIMER } from '@/lib/data/constants';
import { toPercentValue } from '@/lib/format/percentFormat';
import { selectProgressRatio } from '@/store/wizardSelectors';
import { PREVIEW_STEP, useWizardStore } from '@/store/wizardStore';

function StepContent({ step, mode }: { step: number; mode: 'auto' | 'manual' | null }) {
  switch (step) {
    case 0:
      return <StepModeSelect />;
    case 1:
      return <StepPrincipal />;
    case 2:
      return <StepTargetIncome />;
    case 3:
      return <StepCountry />;
    case 4:
      return <StepTaxAndFx />;
    case 5:
      return mode === 'manual' ? <StepManualPicker /> : <StepBondSlider />;
    default:
      return <ResultSection />;
  }
}

export function WizardShell() {
  const step = useWizardStore((state) => state.step);
  const mode = useWizardStore((state) => state.mode);
  const progress = useWizardStore(selectProgressRatio);
  // PRD §9.2 — claim the anonymous uid on app entry, before the user reaches "결과 저장".
  useAnonUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
      <header className="flex flex-col gap-4 pt-8 pb-6 md:pt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-heading text-base font-semibold tracking-tight">
            미국 월배당 ETF
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              배당 현금흐름 계산기
            </span>
          </h1>
          <div className="flex items-baseline gap-4">
            <Link href="/saved" className="text-xs text-muted-foreground underline">
              저장 목록
            </Link>
            <span className="tnum font-mono text-xs text-muted-foreground">
              {Math.min(step, PREVIEW_STEP)} / {PREVIEW_STEP}
            </span>
          </div>
        </div>
        <div className="h-px w-full bg-rule" aria-hidden>
          <div
            className="h-px bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${toPercentValue(progress)}%` }}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_18rem] md:items-start md:gap-10">
        <main className="order-2 flex flex-col pb-10 md:order-1 md:pb-16">
          <StepContent key={step} step={step} mode={mode} />
        </main>
        <div className="contents md:sticky md:top-8 md:order-2 md:block">
          <StatusBox />
        </div>
      </div>

      <footer className="pb-safe border-t border-rule py-6 text-xs leading-relaxed text-muted-foreground">
        {INVESTMENT_DISCLAIMER}
      </footer>
    </div>
  );
}
