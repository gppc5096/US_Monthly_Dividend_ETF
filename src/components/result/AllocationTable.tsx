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
import { BASE_CURRENCY } from '@/lib/data/countries';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import { ETF_GROUP_LABELS } from '@/lib/types/etf';
import type { HoldingResult } from '@/lib/types/result';

interface AllocationTableProps {
  holdings: readonly HoldingResult[];
}

export function AllocationTable({ holdings }: AllocationTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="hidden overflow-hidden rounded-lg border border-rule bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-rule">
              <TableHead className="px-3">종목</TableHead>
              <TableHead className="px-3">그룹</TableHead>
              <TableHead className="px-3 text-right">비중</TableHead>
              <TableHead className="px-3 text-right">평가금액</TableHead>
              <TableHead className="px-3 text-right">배당률</TableHead>
              <TableHead className="px-3 text-right">연 배당</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.ticker} className="border-rule">
                <TableCell className="max-w-[11rem] px-3">
                  <span className="block font-mono font-medium">{holding.ticker}</span>
                  <span className="block truncate text-xs text-muted-foreground">{holding.name}</span>
                </TableCell>
                <TableCell className="px-3">
                  <Badge variant="outline">{ETF_GROUP_LABELS[holding.group]}</Badge>
                </TableCell>
                <TableCell className="tnum px-3 text-right font-mono font-medium">
                  {formatPercent(holding.weight, 1)}
                </TableCell>
                <TableCell className="tnum px-3 text-right font-mono text-muted-foreground">
                  {formatMoney(holding.amountUsd, BASE_CURRENCY)}
                </TableCell>
                <TableCell className="tnum px-3 text-right font-mono text-muted-foreground">
                  {formatPercent(holding.annualYield, 1)}
                </TableCell>
                <TableCell className="tnum px-3 text-right font-mono">
                  {formatMoney(holding.annualGrossUsd, BASE_CURRENCY)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {holdings.map((holding) => (
          <li key={holding.ticker} className="rounded-lg border border-rule bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono font-medium">{holding.ticker}</span>
                <span className="truncate text-xs text-muted-foreground">{holding.name}</span>
              </div>
              <Badge variant="outline" className="shrink-0">
                {ETF_GROUP_LABELS[holding.group]}
              </Badge>
            </div>
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-rule pt-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">비중</dt>
                <dd className="tnum font-mono font-medium">{formatPercent(holding.weight, 1)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">평가금액</dt>
                <dd className="tnum font-mono">{formatMoney(holding.amountUsd, BASE_CURRENCY)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">배당률</dt>
                <dd className="tnum font-mono">{formatPercent(holding.annualYield, 1)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">연 배당(세전)</dt>
                <dd className="tnum font-mono">
                  {formatMoney(holding.annualGrossUsd, BASE_CURRENCY)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
