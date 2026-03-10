import React from 'react';
import { ScoredScenario } from '../types';
import { formatCurrency } from '../utils/dataNormalization';

interface ScenarioTableProps {
  scenarios: ScoredScenario[];
}

const ScenarioTable: React.FC<ScenarioTableProps> = ({ scenarios }) => {
  const sorted = [...scenarios].sort((a, b) => a.rank - b.rank);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-amber-400 font-bold';
    if (rank === scenarios.length) return 'text-red-400';
    return 'text-slate-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 20) return 'text-emerald-400';
    if (score >= 0) return 'text-blue-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-400';
    if (risk >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getBenefitColor = (benefit: number) => {
    if (benefit >= 70) return 'text-emerald-400';
    if (benefit >= 40) return 'text-blue-400';
    return 'text-slate-400';
  };

  const headers = [
    { label: 'Rank', align: 'text-center' },
    { label: 'Scenario', align: 'text-left' },
    { label: 'Benefit', align: 'text-center' },
    { label: 'Risk', align: 'text-center' },
    { label: 'Cost', align: 'text-right' },
    { label: 'Duration', align: 'text-center' },
    { label: 'Norm. Cost', align: 'text-center' },
    { label: 'Decision Score', align: 'text-center' },
  ];

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-base font-semibold text-slate-100 mb-4">Scenario Comparison Table</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map((h) => (
              <th
                key={h.label}
                className={`pb-2 text-xs font-medium text-slate-400 uppercase tracking-wider ${h.align} px-2`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr
              key={s.id}
              className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${
                s.rank === 1 ? 'bg-amber-950/20' : ''
              }`}
            >
              <td className={`py-3 px-2 text-center font-bold ${getRankStyle(s.rank)}`}>
                {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : `#${s.rank}`}
              </td>
              <td className="py-3 px-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-100">{s.name}</span>
                  {s.rank === 1 && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </div>
              </td>
              <td className={`py-3 px-2 text-center font-mono ${getBenefitColor(s.benefit)}`}>
                {s.benefit}
              </td>
              <td className={`py-3 px-2 text-center font-mono ${getRiskColor(s.risk)}`}>
                {s.risk}
              </td>
              <td className="py-3 px-2 text-right font-mono text-slate-200">
                {formatCurrency(s.cost)}
              </td>
              <td className="py-3 px-2 text-center text-slate-300 font-mono">
                {s.duration} mo
              </td>
              <td className="py-3 px-2 text-center font-mono text-blue-400">
                {s.normalizedCost.toFixed(1)}
              </td>
              <td className={`py-3 px-2 text-center font-mono font-bold ${getScoreColor(s.decisionScore)}`}>
                {s.decisionScore.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScenarioTable;
