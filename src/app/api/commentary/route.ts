import { NextResponse } from 'next/server';

import { generateCommentary } from '@/lib/ai/commentary';
import { COMMENTARY_TIMEOUT_MS } from '@/lib/data/constants';
import { portfolioResultSchema } from '@/lib/schema/portfolioInput';

export const dynamic = 'force-dynamic';

const INVALID_BODY = '계산 결과 형식이 올바르지 않습니다.';
const GENERATION_FAILED = '총평을 생성하지 못했습니다.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = portfolioResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID_BODY }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COMMENTARY_TIMEOUT_MS);

  try {
    const text = await generateCommentary(parsed.data, controller.signal);
    return NextResponse.json({ text });
  } catch (error) {
    console.warn('[api/commentary] 총평 생성 실패 — 결과 화면은 그대로 유지됩니다.', error);
    return NextResponse.json({ error: GENERATION_FAILED }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
