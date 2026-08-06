'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/lib/format/currencyFormat';
import type { Scenario } from '@/lib/types/scenario';

interface SavedScenarioTableProps {
  scenarios: Scenario[];
  onView: (scenario: Scenario) => void;
  onDelete: (scenario: Scenario) => void;
}

interface ScenarioRow {
  id: string;
  title: string;
  mode: string;
  principal: string;
  monthlyNet: string;
  savedAt: string;
}

function toRow(scenario: Scenario): ScenarioRow {
  const primary = scenario.result.byCurrency[0];
  return {
    id: scenario.id,
    title: scenario.title,
    mode: scenario.input.mode === 'auto' ? '자동' : '수동',
    principal: formatMoney(scenario.input.principal.amount, scenario.input.principal.currency),
    monthlyNet: primary ? formatMoney(primary.monthlyNet, primary.currency) : '—',
    savedAt: scenario.createdAt === '' ? '—' : new Date(scenario.createdAt).toLocaleDateString('ko-KR'),
  };
}

function Actions({
  scenario,
  onView,
  onDelete,
}: Pick<SavedScenarioTableProps, 'onView' | 'onDelete'> & { scenario: Scenario }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onView(scenario)}>
        보기
      </Button>
      <Button variant="ghost" size="sm" className="text-warn" onClick={() => onDelete(scenario)}>
        삭제
      </Button>
    </div>
  );
}

export function SavedScenarioTable({ scenarios, onView, onDelete }: SavedScenarioTableProps) {
  const rows = scenarios.map(toRow);

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row, index) => (
          <li key={row.id} className="flex flex-col gap-3 rounded-lg border border-rule bg-card p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{row.title}</span>
              <span className="text-xs text-muted-foreground">
                {row.mode} · {row.savedAt}
              </span>
            </div>
            <dl className="tnum grid grid-cols-2 gap-2 font-mono text-sm">
              <div className="flex flex-col">
                <dt className="font-sans text-xs text-muted-foreground">원금</dt>
                <dd>{row.principal}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="font-sans text-xs text-muted-foreground">월 세후</dt>
                <dd className="text-brand">{row.monthlyNet}</dd>
              </div>
            </dl>
            <Actions scenario={scenarios[index]} onView={onView} onDelete={onDelete} />
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>모드</TableHead>
              <TableHead className="text-right">원금</TableHead>
              <TableHead className="text-right">월 세후</TableHead>
              <TableHead>저장일</TableHead>
              <TableHead>동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>{row.mode}</TableCell>
                <TableCell className="tnum text-right font-mono">{row.principal}</TableCell>
                <TableCell className="tnum text-right font-mono text-brand">
                  {row.monthlyNet}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.savedAt}</TableCell>
                <TableCell>
                  <Actions scenario={scenarios[index]} onView={onView} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
