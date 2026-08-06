import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { COMMENTARY_SYSTEM_PROMPT, buildCommentaryPrompt } from '@/lib/ai/prompt';
import { COMMENTARY_MAX_TOKENS, COMMENTARY_TIMEOUT_MS } from '@/lib/data/constants';
import type { PortfolioResult } from '@/lib/schema/portfolioInput';

/** PRD §4.1 표기 그대로. 배포·유지보수 시점에 최신 모델 ID를 재확인할 것. */
const COMMENTARY_MODEL = 'claude-sonnet-5';

export class CommentaryUnavailableError extends Error {}

export async function generateCommentary(
  result: PortfolioResult,
  signal: AbortSignal,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new CommentaryUnavailableError('ANTHROPIC_API_KEY가 설정되지 않았습니다.');
  }

  const client = new Anthropic({ apiKey, maxRetries: 0 });
  const message = await client.messages.create(
    {
      model: COMMENTARY_MODEL,
      max_tokens: COMMENTARY_MAX_TOKENS,
      system: COMMENTARY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildCommentaryPrompt(result) }],
    },
    { signal, timeout: COMMENTARY_TIMEOUT_MS },
  );

  const text = message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim();

  if (text === '') {
    throw new CommentaryUnavailableError('총평 응답이 비어 있습니다.');
  }
  return text;
}
