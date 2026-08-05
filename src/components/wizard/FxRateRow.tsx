'use client';

import { InfoIcon, RotateCcwIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { CurrencyCode } from '@/lib/data/countries';
import { parseAmount } from '@/lib/format/currencyFormat';
import { useWizardStore } from '@/store/wizardStore';

interface FxRateRowProps {
  currency: CurrencyCode;
  rate: number;
  isManual: boolean;
}

export function FxRateRow({ currency, rate, isManual }: FxRateRowProps) {
  const setFxRate = useWizardStore((state) => state.setFxRate);
  const resetFxRate = useWizardStore((state) => state.resetFxRate);
  const [draft, setDraft] = useState(() => String(rate));
  const [lastRate, setLastRate] = useState(rate);

  if (rate !== lastRate) {
    setLastRate(rate);
    setDraft(String(rate));
  }

  return (
    <div className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-b-0">
      <span className="w-14 shrink-0 font-mono text-sm font-medium">{currency}</span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">1 USD =</span>
      <Input
        aria-label={`${currency} 환율`}
        inputMode="decimal"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = parseAmount(event.target.value);
          if (next > 0) setFxRate(currency, next);
        }}
        className="tnum h-11 flex-1 rounded-md text-right font-mono text-base"
      />
      {isManual ? (
        <Badge variant="outline" className="shrink-0 border-warn/50 text-warn">
          수동
        </Badge>
      ) : null}
      {isManual ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${currency} 환율 되돌리기`}
          onClick={() => resetFxRate(currency)}
          className="size-11 shrink-0"
        >
          <RotateCcwIcon />
        </Button>
      ) : (
        <Popover>
          <PopoverTrigger
            aria-label={`${currency} 환율 설명`}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <InfoIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent align="end">
            <PopoverHeader>
              <PopoverTitle><span className="font-mono">{currency}</span> 환율</PopoverTitle>
              <PopoverDescription>
                환율 API에서 자동으로 받아온 값입니다. 직접 입력하면 &quot;수동&quot; 배지가 붙고
                이후 자동 갱신에서 제외됩니다.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
