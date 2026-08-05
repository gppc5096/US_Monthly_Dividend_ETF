'use client';

import type { ReactNode } from 'react';

interface StepFrameProps {
  index: number;
  eyebrow: string;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function StepFrame({ index, eyebrow, title, hint, children }: StepFrameProps) {
  return (
    <section className="step-rise flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <span className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          <span className="font-mono">[{index}]</span> {eyebrow}
        </span>
        <h2 className="font-heading text-2xl leading-tight font-semibold text-balance md:text-3xl">
          {title}
        </h2>
        {hint ? <p className="max-w-prose text-sm text-muted-foreground">{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}
