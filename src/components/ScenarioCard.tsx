import React from 'react';
import { ScoredScenario } from '../types';
import { formatCurrency, isBestScenario } from '../utils/dataNormalization';

interface ScenarioCardProps {
  scenario: ScoredScenario;
  totalScenarios: number;
  onUpdate: (updated: ScoredScenario) => void;
  onDelete: (id: string) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  totalScenarios,
  onUpdate,
  onDelete,
}) => {
  const isBest = isBestScenario(scenario);

  const handleChange = <K extends keyof ScoredScenario>(
    key: K,
    value: ScoredScenario[K]
  ) => {
    onUpdate({ ...scenario, [key]: value });
  };

  const sliders: {
    key: 'cost' | 'risk' | 'benefit' | 'duration';
    label: string;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    color: string;
  }[] = [
    {
      key: 'benefit',
      label: 'Benefit',
      min: 0,
      max: 100,
      step: 1,
      format: (v) => `${v}`,
      color: 'accent-emerald-500',
    },
    {
      key: 'risk',
      label: 'Risk',
      min: 0,
      max: 100,
      step: 1,
      format: (v) => `${v}`,
      color: 'accent-red-500',
    },
    {
      key: 'cost',
      label: 'Cost',
      min: 0,
      max: 2000000,
      step: 10000,
      format: formatCurrency,
      color: 'accent-blue-500',
    },
    {
      key: 'duration',
      label: 'Duration',
      min: 1,
      max: 36,
      step: 1,
      format: (v) => `${v} mo`,
      color: 'accent-purple-500',
    },
  ];

  const rankBadge = () => {
    if (scenario.rank === 1) return '🥇';
    if (scenario.rank === 2) return '🥈';
    if (scenario.rank === 3) return '🥉';
    return `#${scenario.rank}`;
  };

  return (
    <div
      className={`card mb-3 transition-all duration-200 ${
        isBest
          ? 'border-amber-400 shadow-amber-900/40 shadow-xl ring-1 ring-amber-400/30'
          : 'border-slate-700'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isBest && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium shrink-0">
              Best
            </span>
          )}
          <input
            type="text"
            value={scenario.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field text-sm font-semibold bg-transparent border-transparent hover:border-slate-600 focus:border-blue-500 px-1 py-0.5 truncate"
            maxLength={30}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg" title={`Rank ${scenario.rank} of ${totalScenarios}`}>
            {rankBadge()}
          </span>
          <button
            onClick={() => onDelete(scenario.id)}
            className="btn-danger"
            title="Delete scenario"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Score badge */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-slate-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400 mb-0.5">Score</div>
          <div
            className={`text-base font-bold font-mono ${
              scenario.decisionScore >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {scenario.decisionScore.toFixed(1)}
          </div>
        </div>
        <div className="flex-1 bg-slate-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400 mb-0.5">Rank</div>
          <div className="text-base font-bold text-slate-100">
            {scenario.rank}/{totalScenarios}
          </div>
        </div>
        <div className="flex-1 bg-slate-700/50 rounded-lg p-2 text-center">
          <div className="text-xs text-slate-400 mb-0.5">Norm. Cost</div>
          <div className="text-base font-bold text-blue-400">
            {scenario.normalizedCost.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2.5">
        {sliders.map(({ key, label, min, max, step, format, color }) => (
          <div key={key}>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{label}</span>
              <span className="font-mono text-slate-200">{format(scenario[key] as number)}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={scenario[key] as number}
              onChange={(e) =>
                handleChange(key, parseFloat(e.target.value) as ScoredScenario[typeof key])
              }
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${color}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioCard;
