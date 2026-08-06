'use client';

import { BASE_CURRENCY } from '@/lib/data/countries';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import type { MoneyByPeriod, TaxDetail } from '@/lib/types/result';

interface TaxBreakdownProps {
  taxDetail: TaxDetail;
  gross: MoneyByPeriod;
  net: MoneyByPeriod;
}

export function TaxBreakdown({ taxDetail, gross, net }: TaxBreakdownProps) {
  const items = [
    { label: '연 세전 배당', value: formatMoney(gross.annualUsd, BASE_CURRENCY), tone: 'text-foreground' },
    { label: '미국 원천징수', value: `− ${formatMoney(taxDetail.usWithheld, BASE_CURRENCY)}`, tone: 'text-warn' },
    { label: '거주국 추가세', value: `− ${formatMoney(taxDetail.residentTax, BASE_CURRENCY)}`, tone: 'text-warn' },
    { label: '연 세후 배당', value: formatMoney(net.annualUsd, BASE_CURRENCY), tone: 'text-brand' },
  ];

  return (
    <div className="rounded-lg border border-rule bg-card p-4">
      <dl className="flex flex-col gap-2.5 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className={`tnum font-mono ${item.tone}`}>{item.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-rule pt-2.5">
          <dt className="text-muted-foreground">실효세율</dt>
          <dd className="tnum font-mono font-medium">{formatPercent(taxDetail.effectiveRate, 2)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        세액은 모두 달러 기준 연간 금액입니다. 국채형 ETF는 미국 원천징수 대상이 아니며, 외국납부세액공제
        설정에 따라 거주국 추가세가 달라집니다.
      </p>
    </div>
  );
}
