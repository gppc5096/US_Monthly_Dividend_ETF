'use client';

import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import type { FeasibilityDisplay, FeasibilityResult } from '@/lib/types/result';

interface FeasibilityAlertProps {
  feasibility: FeasibilityResult;
  display: FeasibilityDisplay;
}

function Alternative({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-md border border-warn/25 bg-warn/5 px-3 py-2">
      <span className="text-xs tracking-[0.14em] text-warn uppercase">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </li>
  );
}

export function FeasibilityAlert({ feasibility, display }: FeasibilityAlertProps) {
  const { currency } = display;

  if (feasibility.achievable) {
    return (
      <Alert className="border-brand/40 bg-brand/10">
        <CircleCheckIcon className="text-brand" />
        <AlertTitle className="text-brand">목표 달성</AlertTitle>
        <AlertDescription className="text-foreground">
          목표 월 세후 <span className="tnum font-mono">{formatMoney(display.targetMonthlyNet, currency)}</span> 대비{' '}
          <span className="tnum font-mono font-medium">{formatMoney(display.monthlyNet, currency)}</span>{' '}
          ({formatPercent(feasibility.attainmentRate, 0)}) 달성
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-warn/40 bg-warn/10">
      <TriangleAlertIcon className="text-warn" />
      <AlertTitle className="text-warn">목표 미달 — 대안 2가지</AlertTitle>
      <AlertDescription className="text-foreground">
        현재 조건으로는 월 세후{' '}
        <span className="tnum font-mono font-medium">{formatMoney(display.maxMonthlyNet, currency)}</span>
        까지 가능합니다. (목표의 {formatPercent(feasibility.attainmentRate, 0)})
        <ul className="mt-3 flex flex-col gap-2">
          <Alternative label="대안 1 · 원금 조정">
            목표 달성에는 약{' '}
            <span className="tnum font-mono font-medium">
              {formatMoney(display.requiredPrincipal, currency)}
            </span>
            의 원금이 필요합니다.
          </Alternative>
          <Alternative label="대안 2 · 배분 조정">{feasibility.suggestion}</Alternative>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
