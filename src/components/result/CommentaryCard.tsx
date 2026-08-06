'use client';

import { SparklesIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function CommentaryCard() {
  return (
    <div className="rounded-lg border border-dashed border-rule bg-card/60 p-5">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-muted-foreground" />
        <span className="font-heading text-sm font-medium">AI 총평</span>
        <Badge variant="outline" className="ml-auto text-muted-foreground">
          준비 중
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        선정 배경 · 위험 요인 · 조정 제안을 담은 총평이 곧 이 자리에 제공됩니다. 총평은 위 표의 숫자를
        그대로 인용하며, 생성에 실패하더라도 결과 표는 그대로 유지됩니다.
      </p>
    </div>
  );
}
