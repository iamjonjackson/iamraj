import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { ScoredScenario } from '../types';
import { formatCurrency } from '../utils/dataNormalization';

interface DashboardChartsProps {
  scenarios: ScoredScenario[];
}

const CHART_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
];

const BEST_COLOR = '#F59E0B';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        {label && <p className="text-slate-300 font-medium mb-1">{label}</p>}
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}:{' '}
            <span className="font-mono font-semibold">
              {typeof entry.value === 'number' && entry.name === 'Cost'
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload as ScoredScenario;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-100 font-semibold mb-1">{d?.name}</p>
        <p className="text-blue-400">Risk: <span className="font-mono">{d?.risk}</span></p>
        <p className="text-emerald-400">Benefit: <span className="font-mono">{d?.benefit}</span></p>
        <p className="text-purple-400">Score: <span className="font-mono">{d?.decisionScore?.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ scenarios }) => {
  const sorted = [...scenarios].sort((a, b) => a.rank - b.rank);

  const scatterData = scenarios.map((s) => ({
    ...s,
    x: s.risk,
    y: s.benefit,
  }));

  const rankingData = sorted.map((s) => ({
    name: s.name,
    score: parseFloat(s.decisionScore.toFixed(2)),
    rank: s.rank,
  }));

  const costBenefitData = sorted.map((s) => ({
    name: s.name,
    Benefit: s.benefit,
    Risk: s.risk,
    cost: s.cost,
    rank: s.rank,
  }));

  return (
    <div className="space-y-4">
      {/* Row 1: Scatter + Ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Risk vs Benefit Scatter */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Risk vs Benefit</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="x"
                name="Risk"
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Risk →', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                dataKey="y"
                name="Benefit"
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Benefit →', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={scatterData} fill="#3B82F6">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rank === 1 ? BEST_COLOR : CHART_COLORS[index % CHART_COLORS.length]}
                    stroke={entry.rank === 1 ? '#92400e' : 'transparent'}
                    strokeWidth={2}
                    r={entry.rank === 1 ? 8 : 6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {scenarios.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 text-xs text-slate-400">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.rank === 1 ? BEST_COLOR : CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Ranking Bar */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Decision Score Ranking</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={rankingData}
              layout="vertical"
              margin={{ top: 5, right: 40, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={90}
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                {rankingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rank === 1 ? BEST_COLOR : CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  style={{ fill: '#94a3b8', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Cost vs Benefit Grouped Bar */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Benefit & Risk by Scenario</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={costBenefitData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
            />
            <Bar dataKey="Benefit" fill="#10B981" radius={[3, 3, 0, 0]}>
              {costBenefitData.map((entry, index) => (
                <Cell
                  key={`b-${index}`}
                  fill={entry.rank === 1 ? '#34d399' : '#10B981'}
                />
              ))}
            </Bar>
            <Bar dataKey="Risk" fill="#EF4444" radius={[3, 3, 0, 0]}>
              {costBenefitData.map((entry, index) => (
                <Cell
                  key={`r-${index}`}
                  fill={entry.rank === 1 ? '#f87171' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
