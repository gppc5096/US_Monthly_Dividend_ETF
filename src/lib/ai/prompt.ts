import { COMMENTARY_MAX_SENTENCES, COMMENTARY_MIN_SENTENCES } from '@/lib/data/constants';
import { isCoveredCall } from '@/lib/data/etfs';
import { formatMoney } from '@/lib/format/currencyFormat';
import { formatPercent } from '@/lib/format/percentFormat';
import type { PortfolioResult } from '@/lib/schema/portfolioInput';
import { ETF_GROUP_LABELS } from '@/lib/types/etf';

export const COMMENTARY_SYSTEM_PROMPT = [
  '당신은 미국 월배당 ETF 포트폴리오 결과를 읽고 한국어로 짧은 총평을 쓰는 조력자입니다.',
  '',
  '규칙:',
  '- 전달받은 JSON에 있는 숫자만 그대로 인용한다. 새로 계산하거나 없는 수치를 지어내지 않는다.',
  '- 숫자는 JSON에 적힌 표기(통화 기호·단위 포함)를 그대로 옮겨 쓴다.',
  `- 총평은 ${COMMENTARY_MIN_SENTENCES}~${COMMENTARY_MAX_SENTENCES}문장으로 쓰고, 선정 배경 · 위험 요인 · 조정 제안을 각각 담는다.`,
  '- hasCoveredCall이 true이면 커버드콜 ETF의 원금(NAV) 변동·손실 가능성을 지적하는 문장을 반드시 1문장 포함한다.',
  '- 투자 권유나 수익 보장 표현을 쓰지 않는다.',
  '- 머리말·목록·제목 없이 문장만 출력한다.',
].join('\n');

interface HoldingSummary {
  ticker: string;
  name: string;
  group: string;
  weight: string;
  annualYield: string;
  coveredCall: boolean;
}

interface CommentarySummary {
  stage: string;
  bondRatio: string;
  hasCoveredCall: boolean;
  holdings: HoldingSummary[];
  achievable: boolean;
  attainmentRate: string;
  suggestion: string | null;
  effectiveTaxRate: string;
  income: { currency: string; monthlyNet: string; annualNet: string }[];
  quotesAreFallback: boolean;
}

/** PRD §8.3 — the model receives this summary, never the raw calc pipeline. */
export function summarizeResult(result: PortfolioResult): CommentarySummary {
  const holdings = result.holdings
    .filter((holding) => holding.weight > 0)
    .map((holding) => ({
      ticker: holding.ticker,
      name: holding.name,
      group: ETF_GROUP_LABELS[holding.group],
      weight: formatPercent(holding.weight, 1),
      annualYield: formatPercent(holding.annualYield, 2),
      coveredCall: isCoveredCall(holding.ticker),
    }));

  return {
    stage: result.allocation.stage,
    bondRatio: formatPercent(result.allocation.bondRatio, 0),
    hasCoveredCall: holdings.some((holding) => holding.coveredCall),
    holdings,
    achievable: result.feasibility.achievable,
    attainmentRate: formatPercent(result.feasibility.attainmentRate, 0),
    suggestion: result.feasibility.suggestion,
    effectiveTaxRate: formatPercent(result.taxDetail.effectiveRate, 1),
    income: result.byCurrency.map((row) => ({
      currency: row.currency,
      monthlyNet: formatMoney(row.monthlyNet, row.currency),
      annualNet: formatMoney(row.annualNet, row.currency),
    })),
    quotesAreFallback: result.meta.isFallback,
  };
}

export function buildCommentaryPrompt(result: PortfolioResult): string {
  return [
    '다음은 계산이 완료된 포트폴리오 결과 요약입니다.',
    '```json',
    JSON.stringify(summarizeResult(result), null, 2),
    '```',
    '이 값만 사용해 총평을 작성해 주세요.',
  ].join('\n');
}
