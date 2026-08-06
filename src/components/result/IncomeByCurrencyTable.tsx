'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { currencySymbol, formatFxRate, formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import type { CurrencyRow } from '@/lib/types/result';

interface IncomeByCurrencyTableProps {
  rows: readonly CurrencyRow[];
  attainmentRate: number;
  achievable: boolean;
}

const COLUMNS: { key: keyof Pick<CurrencyRow, 'annualGross' | 'annualNet' | 'monthlyGross' | 'monthlyNet'>; label: string }[] = [
  { key: 'annualGross', label: '연 세전' },
  { key: 'annualNet', label: '연 세후' },
  { key: 'monthlyGross', label: '월 세전' },
  { key: 'monthlyNet', label: '월 세후' },
];

export function IncomeByCurrencyTable({
  rows,
  attainmentRate,
  achievable,
}: IncomeByCurrencyTableProps) {
  const attainment = `목표의 ${formatPercent(attainmentRate, 0)}`;
  const badgeClass = achievable
    ? 'border-brand/40 bg-brand/10 text-brand'
    : 'border-warn/40 bg-warn/10 text-warn';

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-hidden rounded-lg border border-rule bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-rule">
              <TableHead className="px-3">통화</TableHead>
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className="px-3 text-right">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.currency} className="border-rule">
                <TableCell className="px-3">
                  <span className="font-medium">{row.currency}</span>
                  <span className="ml-1.5 text-muted-foreground">{currencySymbol(row.currency)}</span>
                  <span className="tnum block font-mono text-xs text-muted-foreground">
                    ×{formatFxRate(row.rate)}
                  </span>
                </TableCell>
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`tnum px-3 text-right font-mono ${
                      column.key === 'monthlyNet' ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <span className="inline-flex flex-col items-end gap-1">
                      {formatMoney(row[column.key], row.currency)}
                      {column.key === 'monthlyNet' ? (
                        <Badge variant="outline" className={`tnum ${badgeClass}`}>
                          {attainment}
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.currency} className="rounded-lg border border-rule bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">
                {row.currency}
                <span className="ml-1.5 text-muted-foreground">{currencySymbol(row.currency)}</span>
              </span>
              <span className="tnum font-mono text-xs text-muted-foreground">
                ×{formatFxRate(row.rate)}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1 border-t border-rule pt-3">
              <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">월 세후</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="tnum font-mono text-xl font-medium">
                  {formatMoney(row.monthlyNet, row.currency)}
                </span>
                <Badge variant="outline" className={`tnum ${badgeClass}`}>
                  {attainment}
                </Badge>
              </div>
            </div>
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-rule pt-3 text-sm">
              {COLUMNS.slice(0, 3).map((column) => (
                <div key={column.key} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{column.label}</dt>
                  <dd className="tnum font-mono">{formatMoney(row[column.key], row.currency)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
