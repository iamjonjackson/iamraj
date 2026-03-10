import React from 'react';
import { Weights } from '../types';

interface WeightControlsProps {
  weights: Weights;
  onChange: (weights: Weights) => void;
}

const WeightControls: React.FC<WeightControlsProps> = ({ weights, onChange }) => {
  const total = weights.benefit + weights.risk + weights.cost;

  const handleChange = (key: keyof Weights, value: number) => {
    onChange({ ...weights, [key]: value });
  };

  const getBarColor = (key: keyof Weights) => {
    if (key === 'benefit') return 'bg-emerald-500';
    if (key === 'risk') return 'bg-red-500';
    return 'bg-blue-500';
  };

  const fields: { key: keyof Weights; label: string; description: string }[] = [
    { key: 'benefit', label: 'Benefit Weight', description: 'Higher = reward benefits more' },
    { key: 'risk', label: 'Risk Weight', description: 'Higher = penalize risk more' },
    { key: 'cost', label: 'Cost Weight', description: 'Higher = penalize cost more' },
  ];

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-100">Decision Weights</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            Math.abs(total - 1) < 0.01
              ? 'bg-emerald-900 text-emerald-300'
              : 'bg-amber-900 text-amber-300'
          }`}
        >
          Total: {total.toFixed(2)}
        </span>
      </div>
      <div className="space-y-4">
        {fields.map(({ key, label, description }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="text-sm font-mono text-slate-100 bg-slate-700 px-2 py-0.5 rounded">
                {weights[key].toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-150 ${getBarColor(key)}`}
                  style={{ width: `${weights[key] * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights[key]}
                onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                className="slider absolute top-0 left-0 opacity-0 w-full cursor-pointer"
                style={{ height: '6px' }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={weights[key]}
                onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
                style={{ marginTop: '-2px' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        ))}
      </div>
      {Math.abs(total - 1) > 0.01 && (
        <div className="mt-3 text-xs text-amber-400 bg-amber-950 rounded-lg p-2">
          ⚠ Weights should sum to 1.0 for best results (currently {total.toFixed(2)})
        </div>
      )}
    </div>
  );
};

export default WeightControls;
