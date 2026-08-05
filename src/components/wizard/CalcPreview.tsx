'use client';

import { usePortfolioResult } from '@/hooks/usePortfolioResult';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import { cn } from '@/lib/utils';
import { useWizardStore } from '@/store/wizardStore';

/** Temporary P3 hand-off surface — the real result screen lands in P4 (PRD §8). */
export function CalcPreview() {
  const goBack = useWizardStore((state) => state.goBack);
  const { result, error, isLoading } = usePortfolioResult();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">시세를 불러오는 중…</p>;
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-destructive">{error ?? '입력이 아직 완성되지 않았습니다.'}</p>
        <Button variant="outline" onClick={goBack}>
          이전 단계로
        </Button>
      </div>
    );
  }

  const primary = result.byCurrency[0];
  const { feasibility } = result;

  return (
    <section className="step-rise flex flex-col gap-6">
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
            feasibility.achievable ? 'text-brand' : 'text-warn',
          )}
        >
          {formatMoney(primary.monthlyNet, primary.currency)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={feasibility.achievable ? 'default' : 'outline'} className="tnum">
            목표의 {formatPercent(feasibility.attainmentRate, 0)}
          </Badge>
          <Badge variant="outline" className="font-mono">
            {result.allocation.stage}
          </Badge>
          {result.meta.isFallback ? (
            <Badge variant="outline" className="border-warn/50 text-warn">
              실시간 시세 연결 실패 — 참고값으로 계산됨
            </Badge>
          ) : null}
        </div>
        {feasibility.suggestion ? (
          <p className="mt-4 text-sm text-muted-foreground">{feasibility.suggestion}</p>
        ) : null}
      </div>

      <details className="rounded-lg border border-rule bg-card">
        <summary className="cursor-pointer px-4 py-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">
          PortfolioResult 원본 (P4에서 화면으로 대체)
        </summary>
        <pre className="max-h-96 overflow-auto border-t border-rule px-4 py-3 font-mono text-xs leading-relaxed">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>

      <Button variant="outline" onClick={goBack} className="h-12 self-start px-6">
        입력 수정하기
      </Button>
    </section>
  );
}
