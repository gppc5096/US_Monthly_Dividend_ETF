import type { PortfolioInput, PortfolioResult } from '@/lib/schema/portfolioInput';

export interface Scenario {
  id: string;
  title: string;
  createdAt: string;
  input: PortfolioInput;
  result: PortfolioResult;
  commentary: string | null;
  asOf: string;
}

export type ScenarioDraft = Omit<Scenario, 'id' | 'createdAt'>;
