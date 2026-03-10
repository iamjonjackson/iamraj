import { ScoredScenario } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function getRankColor(rank: number, total: number): string {
  if (rank === 1) return 'text-amber-400';
  if (rank === total) return 'text-red-400';
  return 'text-slate-300';
}

export function isBestScenario(scenario: ScoredScenario): boolean {
  return scenario.rank === 1;
}
