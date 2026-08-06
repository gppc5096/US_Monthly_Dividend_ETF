'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { formatPercent } from '@/lib/format/percentFormat';
import { ETF_GROUP_LABELS, type EtfGroup } from '@/lib/types/etf';

interface AllocationChartProps {
  groupWeights: Record<EtfGroup, number>;
}

const GROUP_COLORS: Record<EtfGroup, string> = {
  sp500: 'var(--chart-1)',
  nasdaq100: 'var(--chart-3)',
  bond: 'var(--chart-4)',
};

const CHART_HEIGHT = 200;
const INNER_RADIUS = '62%';
const OUTER_RADIUS = '96%';

export function AllocationChart({ groupWeights }: AllocationChartProps) {
  const slices = (Object.keys(ETF_GROUP_LABELS) as EtfGroup[])
    .map((group) => ({ group, label: ETF_GROUP_LABELS[group], weight: groupWeights[group] ?? 0 }))
    .filter((slice) => slice.weight > 0);

  return (
    <div className="flex flex-col items-center gap-5 rounded-lg border border-rule bg-card p-4 sm:flex-row sm:gap-6">
      <div className="h-[200px] w-[200px] shrink-0" aria-hidden>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="weight"
              nameKey="label"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((slice) => (
                <Cell key={slice.group} fill={GROUP_COLORS[slice.group]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <dl className="flex w-full flex-col gap-2.5">
        {slices.map((slice) => (
          <div key={slice.group} className="flex items-baseline justify-between gap-3">
            <dt className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: GROUP_COLORS[slice.group] }}
              />
              {slice.label}
            </dt>
            <dd className="tnum font-mono text-sm font-medium">{formatPercent(slice.weight, 1)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
