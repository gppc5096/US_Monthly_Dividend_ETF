'use client';

import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { fromPercentInput, toPercentInput } from '@/lib/format/percentFormat';
import type { EtfMaster } from '@/lib/types/etf';
import { cn } from '@/lib/utils';

interface ManualHoldingRowProps {
  etf: EtfMaster;
  weight: number | null;
  onToggle: () => void;
  onWeightChange: (weight: number) => void;
}

export function ManualHoldingRow({ etf, weight, onToggle, onWeightChange }: ManualHoldingRowProps) {
  const selected = weight !== null;
  const [draft, setDraft] = useState(() => (weight ? toPercentInput(weight) : ''));
  const [lastWeight, setLastWeight] = useState(weight);

  if (weight !== lastWeight) {
    setLastWeight(weight);
    if (weight === null) setDraft('');
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-rule px-3 py-2.5 transition-colors last:border-b-0',
        selected && 'bg-brand/5',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span
          aria-hidden
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
            selected ? 'border-brand bg-brand text-primary-foreground' : 'border-rule',
          )}
        >
          {selected ? <CheckIcon className="size-3.5" /> : null}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-sm font-medium">{etf.ticker}</span>
          <span className="truncate text-xs text-muted-foreground">{etf.name}</span>
        </span>
      </button>

      <div className="relative w-24 shrink-0">
        <Input
          inputMode="decimal"
          aria-label={`${etf.ticker} 비중`}
          disabled={!selected}
          value={draft}
          placeholder="0"
          onChange={(event) => {
            setDraft(event.target.value);
            const next = fromPercentInput(event.target.value);
            onWeightChange(Number.isFinite(next) ? next : 0);
          }}
          className="tnum h-11 rounded-md pr-7 text-right font-mono text-base"
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-xs text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
