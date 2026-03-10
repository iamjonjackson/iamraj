import React, { useState, useMemo, useRef } from 'react';
import { Scenario, Weights, ScoredScenario } from './types';
import { scoreScenarios } from './utils/scoringAlgorithm';
import { formatCurrency } from './utils/dataNormalization';
import WeightControls from './components/WeightControls';
import ScenarioCard from './components/ScenarioCard';
import DashboardCharts from './components/DashboardCharts';
import ScenarioTable from './components/ScenarioTable';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: 'a', name: 'Scenario A', cost: 500000, risk: 40, benefit: 80, duration: 12 },
  { id: 'b', name: 'Scenario B', cost: 350000, risk: 60, benefit: 70, duration: 10 },
  { id: 'c', name: 'Scenario C', cost: 650000, risk: 30, benefit: 90, duration: 14 },
];

const DEFAULT_WEIGHTS: Weights = {
  benefit: 0.5,
  risk: 0.3,
  cost: 0.2,
};

const MAX_SCENARIOS = 5;

let nextId = 1;
function generateId(): string {
  return `scenario-${Date.now()}-${nextId++}`;
}

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const scoredScenarios: ScoredScenario[] = useMemo(
    () => scoreScenarios(scenarios, weights),
    [scenarios, weights]
  );

  const handleUpdateScenario = (updated: ScoredScenario) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === updated.id
          ? {
              id: updated.id,
              name: updated.name,
              cost: updated.cost,
              risk: updated.risk,
              benefit: updated.benefit,
              duration: updated.duration,
            }
          : s
      )
    );
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
  };

  const handleAddScenario = () => {
    if (scenarios.length >= MAX_SCENARIOS) return;
    const newScenario: Scenario = {
      id: generateId(),
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}`,
      cost: 400000,
      risk: 50,
      benefit: 70,
      duration: 12,
    };
    setScenarios((prev) => [...prev, newScenario]);
  };

  const handleReset = () => {
    setScenarios(DEFAULT_SCENARIOS);
    setWeights(DEFAULT_WEIGHTS);
  };

  const handleExportCSV = () => {
    const sorted = [...scoredScenarios].sort((a, b) => a.rank - b.rank);
    const data = sorted.map((s) => ({
      Rank: s.rank,
      Name: s.name,
      Benefit: s.benefit,
      Risk: s.risk,
      Cost: s.cost,
      'Duration (months)': s.duration,
      'Normalized Cost': s.normalizedCost.toFixed(2),
      'Decision Score': s.decisionScore.toFixed(2),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-simulation-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const sorted = [...scoredScenarios].sort((a, b) => a.rank - b.rank);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('Project Risk Simulation Dashboard', 14, 18);

    // Subtitle / metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(
      `Weights — Benefit: ${weights.benefit.toFixed(2)}  Risk: ${weights.risk.toFixed(2)}  Cost: ${weights.cost.toFixed(2)}`,
      14,
      32
    );

    // Best scenario highlight
    const best = sorted[0];
    doc.setFontSize(11);
    doc.setTextColor(180, 120, 0);
    doc.text(`🏆 Best Scenario: ${best.name}  (Score: ${best.decisionScore.toFixed(2)})`, 14, 42);

    // Table
    autoTable(doc, {
      startY: 50,
      head: [['Rank', 'Name', 'Benefit', 'Risk', 'Cost', 'Duration', 'Norm. Cost', 'Score']],
      body: sorted.map((s) => [
        `#${s.rank}`,
        s.name,
        s.benefit,
        s.risk,
        formatCurrency(s.cost),
        `${s.duration} mo`,
        s.normalizedCost.toFixed(1),
        s.decisionScore.toFixed(2),
      ]),
      headStyles: { fillColor: [30, 41, 59], textColor: [148, 163, 184] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      styles: { fontSize: 10 },
    });

    doc.save('risk-simulation-results.pdf');
    setExportOpen(false);
  };

  // Close dropdown when clicking outside
  const handleDocClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
      setExportOpen(false);
    }
  };

  const bestScenario = scoredScenarios.find((s) => s.rank === 1);

  return (
    <div className="min-h-screen bg-slate-900" onClick={handleDocClick}>
      {/* ── Header ── */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              R
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                Project Risk Simulation Dashboard
              </h1>
              {bestScenario && (
                <p className="text-xs text-slate-400 hidden sm:block">
                  Best:{' '}
                  <span className="text-amber-400 font-medium">{bestScenario.name}</span>
                  {' '}— Score{' '}
                  <span className="font-mono text-amber-400">
                    {bestScenario.decisionScore.toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAddScenario}
              disabled={scenarios.length >= MAX_SCENARIOS}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span>
              <span>Add Scenario</span>
            </button>

            <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5">
              <span>↺</span>
              <span>Reset</span>
            </button>

            {/* Export dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExportOpen((o) => !o);
                }}
                className="btn-secondary flex items-center gap-1.5"
              >
                <span>↓</span>
                <span>Export</span>
                <span className="text-xs opacity-60">▾</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span>📄</span> Export PDF
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span>📊</span> Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Left Panel ── */}
          <aside className="xl:w-80 shrink-0">
            <WeightControls weights={weights} onChange={setWeights} />
            <div className="space-y-0">
              {scoredScenarios.map((s) => (
                <ScenarioCard
                  key={s.id}
                  scenario={s}
                  totalScenarios={scoredScenarios.length}
                  onUpdate={handleUpdateScenario}
                  onDelete={handleDeleteScenario}
                />
              ))}
            </div>
            {scenarios.length >= MAX_SCENARIOS && (
              <p className="text-xs text-amber-400 text-center mt-2 bg-amber-950/30 rounded-lg p-2">
                Maximum of {MAX_SCENARIOS} scenarios reached
              </p>
            )}
          </aside>

          {/* ── Center Panel ── */}
          <section className="flex-1 min-w-0">
            <DashboardCharts scenarios={scoredScenarios} />
          </section>
        </div>

        {/* ── Bottom Panel ── */}
        <div className="mt-6">
          <ScenarioTable scenarios={scoredScenarios} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 mt-8 py-4 text-center text-xs text-slate-600">
        Project Risk Simulation Dashboard — Real-time scenario scoring &amp; comparison
      </footer>
    </div>
  );
};

export default App;
