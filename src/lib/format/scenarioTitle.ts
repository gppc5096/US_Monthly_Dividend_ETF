import { formatMoney } from '@/lib/format/currencyFormat';
import type { PortfolioInput } from '@/lib/schema/portfolioInput';

/** en-CA renders as YYYY-MM-DD in the viewer's own timezone. */
const DATE_LOCALE = 'en-CA';

/** PRD §9.2 default title, e.g. "2026-08-05 자동배분 월$2,500". */
export function suggestScenarioTitle(input: PortfolioInput, now: Date = new Date()): string {
  const date = now.toLocaleDateString(DATE_LOCALE);
  const mode = input.mode === 'auto' ? '자동배분' : '수동선택';
  const target = formatMoney(input.targetMonthlyNet.amount, input.targetMonthlyNet.currency);
  return `${date} ${mode} 월${target}`;
}
