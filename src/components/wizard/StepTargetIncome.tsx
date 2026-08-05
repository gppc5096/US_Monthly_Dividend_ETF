'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { AmountField } from '@/components/wizard/AmountField';
import { StepFrame } from '@/components/wizard/StepFrame';
import { WizardNav } from '@/components/wizard/WizardNav';
import { type CurrencyCode } from '@/lib/data/countries';
import { formatMoney, parseAmount } from '@/lib/format/currencyFormat';
import { currencyCodeSchema } from '@/lib/schema/portfolioInput';
import { useWizardStore } from '@/store/wizardStore';

const schema = z.object({
  raw: z
    .string()
    .min(1, '목표 월 수령액을 입력하세요.')
    .refine((value) => parseAmount(value) > 0, '0보다 큰 금액을 입력하세요.'),
  currency: currencyCodeSchema,
});

type FormValues = z.infer<typeof schema>;

export function StepTargetIncome() {
  const target = useWizardStore((state) => state.targetMonthlyNet);
  const setTargetMonthlyNet = useWizardStore((state) => state.setTargetMonthlyNet);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      raw: target.amount > 0 ? String(target.amount) : '',
      currency: target.currency,
    },
  });

  const raw = useWatch({ control: form.control, name: 'raw' });
  const currency = useWatch({ control: form.control, name: 'currency' });
  const amount = parseAmount(raw);

  const submit = form.handleSubmit((values) => {
    setTargetMonthlyNet({ amount: parseAmount(values.raw), currency: values.currency });
    confirmStep(2);
  });

  return (
    <StepFrame
      index={2}
      eyebrow="목표"
      title="매달 세후로 얼마를 받고 싶으신가요?"
      hint="세금까지 뗀 뒤 손에 쥐는 금액입니다. 원금으로 닿지 못해도 최대 가능액과 필요 원금을 알려 드립니다."
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <AmountField
          id="target"
          value={raw}
          currency={currency}
          placeholder="0"
          error={form.formState.errors.raw?.message}
          onValueChange={(next) => form.setValue('raw', next, { shouldValidate: false })}
          onCurrencyChange={(next: CurrencyCode) => form.setValue('currency', next)}
        />
        <p className="tnum text-sm text-muted-foreground" aria-live="polite">
          {amount > 0
            ? `${formatMoney(amount, currency)} / 월`
            : '금액을 입력하면 자릿수를 확인해 드립니다.'}
        </p>
      </form>

      <WizardNav onBack={goBack} onNext={submit} />
    </StepFrame>
  );
}
