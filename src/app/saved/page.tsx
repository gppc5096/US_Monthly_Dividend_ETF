'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { DeleteConfirmDialog } from '@/components/saved/DeleteConfirmDialog';
import { SavedScenarioTable } from '@/components/saved/SavedScenarioTable';
import { useScenarios } from '@/hooks/useScenarios';
import { INVESTMENT_DISCLAIMER } from '@/lib/data/constants';
import type { Scenario } from '@/lib/types/scenario';
import { useWizardStore } from '@/store/wizardStore';

/** PRD §9.3 — anonymous auth is bound to this browser only. */
const ANON_LIMIT_NOTICE =
  '브라우저 데이터를 삭제하거나 다른 기기로 접속하면 저장 목록이 보이지 않습니다.';

const DELETE_FAILED = '삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';

export default function SavedPage() {
  const router = useRouter();
  const restoreFromInput = useWizardStore((state) => state.restoreFromInput);
  const { scenarios, isLoading, error, remove } = useScenarios();
  const [pending, setPending] = useState<Scenario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function view(scenario: Scenario) {
    restoreFromInput(scenario.input);
    router.push('/');
  }

  async function confirmDelete() {
    if (!pending) return;
    setIsDeleting(true);
    try {
      await remove(pending.id);
      setPending(null);
      toast.success('삭제했습니다');
    } catch (cause) {
      console.warn('[SavedPage] 삭제 실패', cause);
      toast.error(DELETE_FAILED);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 md:px-8">
      <header className="flex flex-col gap-3 pt-8 pb-6 md:pt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
            저장한 시나리오
          </h1>
          <Link href="/" className="text-xs text-muted-foreground underline">
            계산기로 돌아가기
          </Link>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{ANON_LIMIT_NOTICE}</p>
      </header>

      <main className="flex flex-1 flex-col pb-10 md:pb-16">
        {isLoading ? <p className="text-sm text-muted-foreground">불러오는 중…</p> : null}
        {!isLoading && error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!isLoading && !error && scenarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 저장한 시나리오가 없습니다. 결과 화면에서 &lsquo;결과 저장&rsquo;을 눌러 보세요.
          </p>
        ) : null}
        {!isLoading && !error && scenarios.length > 0 ? (
          <SavedScenarioTable scenarios={scenarios} onView={view} onDelete={setPending} />
        ) : null}
      </main>

      <DeleteConfirmDialog
        title={pending?.title ?? null}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        onConfirm={confirmDelete}
      />

      <footer className="pb-safe border-t border-rule py-6 text-xs leading-relaxed text-muted-foreground">
        {INVESTMENT_DISCLAIMER}
      </footer>
    </div>
  );
}
