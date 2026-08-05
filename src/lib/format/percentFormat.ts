import { PERCENT_DIVISOR } from '@/lib/data/constants';

/** 0.154 -> "15.4%" */
export function formatPercent(ratio: number, maximumFractionDigits = 2): string {
  return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits }).format(
    ratio * PERCENT_DIVISOR,
  )}%`;
}

/** 0.154 -> "15.4" for editable percentage fields. */
export function toPercentInput(ratio: number, maximumFractionDigits = 3): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    useGrouping: false,
  }).format(ratio * PERCENT_DIVISOR);
}

/** Ratio <-> whole-percent scaling for slider-style controls. */
export const toPercentValue = (ratio: number) => ratio * PERCENT_DIVISOR;
export const fromPercentValue = (value: number) => value / PERCENT_DIVISOR;

/** The other side of a 0..1 split, e.g. the equity sleeve next to a bond ratio. */
export const complementRatio = (ratio: number) => 1 - ratio;

/** "15.4" -> 0.154; NaN when the field holds no number. */
export function fromPercentInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  return cleaned === '' ? Number.NaN : Number(cleaned) / PERCENT_DIVISOR;
}
