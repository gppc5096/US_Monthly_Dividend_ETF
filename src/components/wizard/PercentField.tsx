'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fromPercentInput, toPercentInput } from '@/lib/format/percentFormat';

interface PercentFieldProps {
  id: string;
  label: string;
  /** Ratio, e.g. 0.154 for 15.4%. */
  value: number;
  onCommit: (ratio: number) => void;
}

/** Holds the raw keystrokes so a trailing "." survives the round trip through the store. */
export function PercentField({ id, label, value, onCommit }: PercentFieldProps) {
  const [draft, setDraft] = useState(() => toPercentInput(value));
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setDraft(toPercentInput(value));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-xs tracking-[0.14em] uppercase">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            const next = fromPercentInput(event.target.value);
            if (Number.isFinite(next) && next >= 0 && next <= 1) onCommit(next);
          }}
          className="tnum h-12 rounded-md pr-9 text-right font-mono text-lg"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
