'use client';

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface WizardNavProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  helper?: string;
}

export function WizardNav({
  onBack,
  onNext,
  nextLabel = '다음',
  nextDisabled = false,
  backDisabled = false,
  helper,
}: WizardNavProps) {
  return (
    <div className="pb-safe sticky bottom-0 z-30 -mx-4 border-t border-rule bg-background/95 px-4 pt-3 pb-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-2 md:backdrop-blur-none">
      {helper ? (
        <p className="mb-2 text-xs text-warn md:mb-3" role="status">
          {helper}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={backDisabled}
          className="h-12 min-w-[7rem] flex-1 gap-2 text-base md:h-11 md:flex-none"
        >
          <ArrowLeftIcon />
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="h-12 flex-[2] gap-2 text-base font-semibold md:h-11 md:flex-none md:px-8"
        >
          {nextLabel}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
