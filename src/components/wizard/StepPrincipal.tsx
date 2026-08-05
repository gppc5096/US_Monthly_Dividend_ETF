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
    .min(1, '총 투자금을 입력하세요.')
    .refine((value) => parseAmount(value) > 0, '0보다 큰 금액을 입력하세요.'),
  currency: currencyCodeSchema,
});

type FormValues = z.infer<typeof schema>;

export function StepPrincipal() {
  const principal = useWizardStore((state) => state.principal);
  const setPrincipal = useWizardStore((state) => state.setPrincipal);
  const confirmStep = useWizardStore((state) => state.confirmStep);
  const goBack = useWizardStore((state) => state.goBack);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      raw: principal.amount > 0 ? String(principal.amount) : '',
      currency: principal.currency,
    },
  });

  const raw = useWatch({ control: form.control, name: 'raw' });
  const currency = useWatch({ control: form.control, name: 'currency' });
  const amount = parseAmount(raw);

  const submit = form.handleSubmit((values) => {
    setPrincipal({ amount: parseAmount(values.raw), currency: values.currency });
    confirmStep(1);
  });

  return (
    <StepFrame
      index={1}
      eyebrow="원금"
      title="총 투자금은 얼마인가요?"
      hint="이 금액 전체가 ETF에 배분된다고 가정합니다. 수수료·매수 단가는 반영하지 않습니다."
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <AmountField
          id="principal"
          value={raw}
          currency={currency}
          placeholder="0"
          error={form.formState.errors.raw?.message}
          onValueChange={(next) => form.setValue('raw', next, { shouldValidate: false })}
          onCurrencyChange={(next: CurrencyCode) => form.setValue('currency', next)}
        />
        <p className="tnum text-sm text-muted-foreground" aria-live="polite">
          {amount > 0 ? formatMoney(amount, currency) : '금액을 입력하면 자릿수를 확인해 드립니다.'}
        </p>
      </form>

      <WizardNav onBack={goBack} onNext={submit} />
    </StepFrame>
  );
}
