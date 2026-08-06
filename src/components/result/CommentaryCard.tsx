'use client';

import { RefreshCwIcon, SparklesIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PortfolioResult } from '@/lib/schema/portfolioInput';

type CommentaryStatus = 'loading' | 'ready' | 'failed';

const FAILED_MESSAGE = '총평 생성에 실패했습니다. 아래 결과 표와 차트는 그대로 유효합니다.';

interface CommentaryCardProps {
  result: PortfolioResult;
}

export function CommentaryCard({ result }: CommentaryCardProps) {
  const [status, setStatus] = useState<CommentaryStatus>('loading');
  const [text, setText] = useState('');
  const [attempt, setAttempt] = useState(0);
  const body = useMemo(() => JSON.stringify(result), [result]);

  function retry() {
    setStatus('loading');
    setAttempt((value) => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as { text?: string };
        if (!response.ok || !payload.text) throw new Error('총평 응답이 올바르지 않습니다.');
        setText(payload.text);
        setStatus('ready');
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        console.warn('[CommentaryCard] 총평 생성 실패', cause);
        setStatus('failed');
      });

    return () => controller.abort();
  }, [body, attempt]);

  return (
    <div className="rounded-lg border border-dashed border-rule bg-card/60 p-5">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-muted-foreground" />
        <span className="font-heading text-sm font-medium">AI 총평</span>
        {status === 'loading' ? (
          <Badge variant="outline" className="ml-auto text-muted-foreground">
            생성 중…
          </Badge>
        ) : null}
      </div>

      {status === 'loading' ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          선정 배경 · 위험 요인 · 조정 제안을 정리하는 중입니다.
        </p>
      ) : null}

      {status === 'ready' ? (
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{text}</p>
      ) : null}

      {status === 'failed' ? (
        <div className="mt-3 flex flex-col items-start gap-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{FAILED_MESSAGE}</p>
          <Button variant="outline" onClick={retry} className="h-11">
            <RefreshCwIcon className="size-4" />
            다시 시도
          </Button>
        </div>
      ) : null}
    </div>
  );
}
