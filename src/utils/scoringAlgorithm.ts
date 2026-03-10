import { Scenario, Weights, ScoredScenario } from '../types';

export function normalizeValues(scenarios: Scenario[]): number[] {
  const costs = scenarios.map((s) => s.cost);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const range = maxCost - minCost;
  return scenarios.map((s) =>
    range === 0 ? 50 : ((s.cost - minCost) / range) * 100
  );
}

export function scoreScenarios(
  scenarios: Scenario[],
  weights: Weights
): ScoredScenario[] {
  const normalizedCosts = normalizeValues(scenarios);

  const scored = scenarios.map((scenario, index) => {
    const normalizedCost = normalizedCosts[index];
    const decisionScore =
      weights.benefit * scenario.benefit -
      weights.risk * scenario.risk -
      weights.cost * normalizedCost;
    return { ...scenario, normalizedCost, decisionScore, rank: 0 };
  });

  // Assign ranks (highest score = rank 1)
  const sorted = [...scored].sort((a, b) => b.decisionScore - a.decisionScore);
  sorted.forEach((s, i) => {
    const original = scored.find((sc) => sc.id === s.id);
    if (original) original.rank = i + 1;
  });

  return scored;
}
