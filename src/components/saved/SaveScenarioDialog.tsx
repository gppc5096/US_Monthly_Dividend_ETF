'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAnonUser } from '@/hooks/useAnonUser';
import { createScenario } from '@/lib/firebase/scenarios';
import { suggestScenarioTitle } from '@/lib/format/scenarioTitle';
import type { PortfolioInput, PortfolioResult } from '@/lib/schema/portfolioInput';

const SAVE_FAILED = '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
const TITLE_FIELD_ID = 'scenario-title';

interface SaveScenarioDialogProps {
  input: PortfolioInput;
  result: PortfolioResult;
}

export function SaveScenarioDialog({ input, result }: SaveScenarioDialogProps) {
  const { uid, isLoading: isAuthLoading } = useAnonUser();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function open() {
    setTitle(suggestScenarioTitle(input));
    setIsOpen(true);
  }

  async function save() {
    if (!uid) return;
    setIsSaving(true);
    try {
      await createScenario(uid, {
        title: title.trim(),
        input,
        result,
        commentary: null,
        asOf: result.meta.asOf,
      });
      setIsOpen(false);
      toast.success('저장했습니다', {
        description: <Link href="/saved" className="underline">저장 목록 보기</Link>,
      });
    } catch (cause) {
      console.warn('[SaveScenarioDialog] 저장 실패', cause);
      toast.error(SAVE_FAILED);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button onClick={open} disabled={isAuthLoading || !uid} className="h-12 px-6">
        결과 저장
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결과 저장</DialogTitle>
            <DialogDescription>
              나중에 목록에서 다시 열어볼 수 있도록 제목을 정해 주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={TITLE_FIELD_ID}>제목</Label>
            <Input
              id={TITLE_FIELD_ID}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
            <Button onClick={save} disabled={isSaving || title.trim() === ''}>
              {isSaving ? '저장 중…' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
