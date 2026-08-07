'use client';

import type { ReactNode } from 'react';

import { AllocationChart } from '@/components/result/AllocationChart';
import { AllocationTable } from '@/components/result/AllocationTable';
import { CommentaryCard } from '@/components/result/CommentaryCard';
import { FeasibilityAlert } from '@/components/result/FeasibilityAlert';
import { IncomeByCurrencyTable } from '@/components/result/IncomeByCurrencyTable';
import { TaxBreakdown } from '@/components/result/TaxBreakdown';
import { SaveScenarioDialog } from '@/components/saved/SaveScenarioDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePortfolioResult } from '@/hooks/usePortfolioResult';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/wizardStore';

function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-heading text-base font-medium">{title}</h3>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function ResultSection() {
  const goBack = useWizardStore((state) => state.goBack);
  const { input, result, feasibility, error, isLoading } = usePortfolioResult();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">시세를 불러오는 중…</p>;
  }

  if (error || !input || !result || !feasibility) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-destructive">{error ?? '입력이 아직 완성되지 않았습니다.'}</p>
        <Button variant="outline" onClick={goBack} className="h-11 px-4">
          이전 단계로
        </Button>
      </div>
    );
  }

  const { allocation, byCurrency, holdings, meta, taxDetail } = result;
  const achievable = result.feasibility.achievable;

  return (
    <section className="step-rise flex flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          <span className="font-mono">[6]</span> 계산 완료
        </span>
        <h2 className="font-heading text-2xl font-semibold md:text-3xl">월 세후 수령액</h2>
      </header>

      <div className="rounded-lg border border-rule bg-card p-6">
        <p
          className={cn(
            'tnum font-mono text-4xl leading-none font-medium md:text-6xl',
            achievable ? 'text-brand' : 'text-warn',
          )}
        >
          {formatMoney(feasibility.monthlyNet, feasibility.currency)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={achievable ? 'default' : 'outline'} className="tnum">
            목표의 {formatPercent(result.feasibility.attainmentRate, 0)}
          </Badge>
          <Badge variant="outline" className="font-mono">
            {allocation.stage}
          </Badge>
          {meta.isFallback ? (
            <Badge variant="outline" className="border-warn/50 text-warn">
              실시간 시세 연결 실패 — 참고값으로 계산됨
            </Badge>
          ) : null}
        </div>
      </div>

      <FeasibilityAlert feasibility={result.feasibility} display={feasibility} />

      <Block
        title="포트폴리오 배분"
        hint={`채권 ${formatPercent(allocation.bondRatio, 0)} · 금액은 USD 기준`}
      >
        <AllocationChart groupWeights={allocation.groupWeights} />
        <AllocationTable holdings={holdings} />
      </Block>

      <Block title="통화별 수령액" hint="연·월 세전 / 세후">
        <IncomeByCurrencyTable
          rows={byCurrency}
          attainmentRate={result.feasibility.attainmentRate}
          achievable={achievable}
        />
      </Block>

      <Block title="세금 분해">
        <TaxBreakdown taxDetail={taxDetail} gross={result.gross} net={result.net} />
      </Block>

      <CommentaryCard result={result} />

      <div className="flex flex-wrap gap-3">
        <SaveScenarioDialog input={input} result={result} />
        <Button variant="outline" onClick={goBack} className="h-12 px-6">
          입력 수정하기
        </Button>
      </div>
    </section>
  );
}
