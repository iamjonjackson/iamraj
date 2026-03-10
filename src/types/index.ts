export interface Scenario {
  id: string;
  name: string;
  cost: number;      // 0 - 2,000,000
  risk: number;      // 0 - 100
  benefit: number;   // 0 - 100
  duration: number;  // 1 - 36 months
}

export interface Weights {
  benefit: number;   // default 0.5
  risk: number;      // default 0.3
  cost: number;      // default 0.2
}

export interface ScoredScenario extends Scenario {
  normalizedCost: number;
  decisionScore: number;
  rank: number;
}
