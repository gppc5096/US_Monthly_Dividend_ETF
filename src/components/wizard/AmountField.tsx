'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_CODES, type CurrencyCode } from '@/lib/data/countries';
import { currencySymbol } from '@/lib/format/currencyFormat';

interface AmountFieldProps {
  id: string;
  value: string;
  currency: CurrencyCode;
  placeholder?: string;
  error?: string;
  onValueChange: (raw: string) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function AmountField({
  id,
  value,
  currency,
  placeholder,
  error,
  onValueChange,
  onCurrencyChange,
}: AmountFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-mono text-lg text-muted-foreground"
          >
            {currencySymbol(currency)}
          </span>
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onValueChange(event.target.value)}
            className="tnum h-14 rounded-md pr-4 pl-11 text-right font-mono text-2xl tracking-tight md:text-2xl"
          />
        </div>
        <Select
          value={currency}
          onValueChange={(next) => onCurrencyChange(next as CurrencyCode)}
        >
          <SelectTrigger
            aria-label="입력 통화"
            className="h-14 w-24 justify-center rounded-md px-3 font-mono text-base"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_CODES.map((code) => (
              <SelectItem key={code} value={code} className="font-mono">
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
