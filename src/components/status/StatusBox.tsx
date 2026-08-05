'use client';

import { ChevronDownIcon, PencilIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import { selectStatusItems } from '@/store/wizardSelectors';
import { useWizardStore } from '@/store/wizardStore';

export function StatusBox() {
  const state = useWizardStore();
  const items = useMemo(() => selectStatusItems(state), [state]);
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <aside
      className="sticky top-0 z-20 -mx-4 border-b border-rule bg-background/95 backdrop-blur md:static md:mx-0 md:rounded-lg md:border md:bg-card md:backdrop-blur-none"
      aria-label="입력 현황"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:cursor-default md:py-3.5"
      >
        <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
          입력 현황
        </span>
        <span className="flex items-center gap-2">
          <span className="tnum text-xs text-muted-foreground">{items.length}건</span>
          <ChevronDownIcon
            aria-hidden
            className={cn(
              'size-4 text-muted-foreground transition-transform md:hidden',
              isOpen && 'rotate-180',
            )}
          />
        </span>
      </button>

      <div className={cn('md:block', isOpen ? 'block' : 'hidden')}>
        <div className="stub-edge h-px w-full md:hidden" />
        <ul className="flex flex-col px-2 pt-1 pb-3 md:px-2 md:pb-2">
          {items.map((item) => (
            <li key={item.step}>
              <button
                type="button"
                onClick={() => {
                  state.goToStep(item.step);
                  setIsOpen(false);
                }}
                className="group flex min-h-11 w-full items-baseline justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono">[{item.step}]</span>
                  {item.label}
                  <PencilIcon
                    aria-hidden
                    className="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </span>
                <span className="tnum text-right text-sm font-medium break-keep">
                  {item.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
