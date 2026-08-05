'use client';

import { CheckIcon } from 'lucide-react';

import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/wizardStore';

const MODES = [
  {
    value: 'auto',
    title: '자동 배분',
    caption: '알고리즘이 정한다',
    body: '채권 비중만 정하면 10종을 3그룹으로 분산하고, 목표에 닿을 때까지 배분을 조정합니다.',
  },
  {
    value: 'manual',
    title: '수동 선택',
    caption: '내가 정한다',
    body: '원하는 종목을 직접 고르고 비중을 입력합니다. 합계는 100%가 되어야 합니다.',
  },
] as const;

export function StepModeSelect() {
  const mode = useWizardStore((state) => state.mode);
  const setMode = useWizardStore((state) => state.setMode);
  const confirmStep = useWizardStore((state) => state.confirmStep);

  return (
    <StepFrame
      index={0}
      eyebrow="배분 방식"
      title="종목 배분을 어떻게 정할까요?"
      hint="나중에 처음으로 돌아와 바꿀 수 있습니다."
    >
      <RadioGroup
        value={mode}
        onValueChange={(value) => setMode(value as 'auto' | 'manual')}
        className="grid gap-3 sm:grid-cols-2"
      >
        {MODES.map((option) => (
          <label
            key={option.value}
            className={cn(
              'group relative flex min-h-[8.5rem] cursor-pointer flex-col gap-2 rounded-lg border bg-card p-5 transition-colors',
              'hover:border-brand/60 has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
              mode === option.value ? 'border-brand bg-brand/5' : 'border-rule',
            )}
          >
            <RadioGroupItem value={option.value} className="sr-only" />
            <span className="flex items-center justify-between">
              <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {option.caption}
              </span>
              <span
                aria-hidden
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border transition-colors',
                  mode === option.value
                    ? 'border-brand bg-brand text-primary-foreground'
                    : 'border-rule text-transparent',
                )}
              >
                <CheckIcon className="size-3" />
              </span>
            </span>
            <span className="font-heading text-lg font-semibold">{option.title}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">{option.body}</span>
          </label>
        ))}
      </RadioGroup>

      <WizardNav
        onBack={() => undefined}
        backDisabled
        onNext={() => confirmStep(0)}
        nextDisabled={!mode}
        helper={mode ? undefined : '배분 방식을 먼저 선택하세요.'}
      />
    </StepFrame>
  );
}
