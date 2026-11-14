import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Check, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { RankedPlayer } from '../../lib/data/types';

interface TraceRatingWidgetProps {
  batters: RankedPlayer[];
  bowlers: RankedPlayer[];
}

export const TraceRatingWidget: React.FC<TraceRatingWidgetProps> = ({
  batters,
  bowlers,
}) => {
  const [role, setRole] = useState<'batter' | 'bowler'>('batter');
  const [search, setSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | number>(
    batters[0]?.player_id || ''
  );

  const playerList = useMemo(() => {
    const list = role === 'batter' ? batters : bowlers;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        p.player_name.toLowerCase().includes(q) ||
        String(p.player_id).includes(q)
    );
  }, [role, batters, bowlers, search]);

  const selectedPlayer = useMemo(() => {
    const currentList = role === 'batter' ? batters : bowlers;
    return (
      currentList.find((p) => String(p.player_id) === String(selectedPlayerId)) ||
      currentList[0]
    );
  }, [role, batters, bowlers, selectedPlayerId]);

  if (!selectedPlayer) {
    return null;
  }

  // Model parameters from Phase 03/04 specifications
  const priorMu = role === 'batter' ? 0.0 : 0.0;
  const priorTau = role === 'batter' ? 0.28 : 0.25;
  const nDeliv = selectedPlayer.n_pressure_deliveries || selectedPlayer.neff_pressure || 100;
  const neff = selectedPlayer.neff_pressure || nDeliv;
  const sigmaSquared = 1.0 / Math.max(neff, 1);
  const tauSquared = priorTau * priorTau;
  const shrinkageB = sigmaSquared / (sigmaSquared + tauSquared);
  const weightPV = 0.50;
  const weightCD = 0.35;
  const weightPC = 0.15;

  return (
    <div id="trace-a-rating" className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 lg:p-8 space-y-6">
      {/* Title & Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink-100 text-brand-pink">
              INTERACTIVE TOOL
            </span>
            <span className="text-xs font-mono text-slate-500">
              AUDITABLE STEP-BY-STEP CALCULATION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Trace a Rating: End-to-End Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any of the 306 qualified players to inspect the exact transformation from ball-by-ball Delta-V to final displayed rating.
          </p>
        </div>

        {/* Role & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setRole('batter');
                setSelectedPlayerId(batters[0]?.player_id || '');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                role === 'batter'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Batters (155)
            </button>
            <button
              onClick={() => {
                setRole('bowler');
                setSelectedPlayerId(bowlers[0]?.player_id || '');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                role === 'bowler'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bowlers (151)
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>

      {/* Quick Player Select Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {playerList.slice(0, 10).map((p) => {
          const isSelected = String(p.player_id) === String(selectedPlayer.player_id);
          return (
            <button
              key={p.player_id}
              onClick={() => setSelectedPlayerId(p.player_id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#14213D] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="font-mono text-[10px] opacity-75">#{p.rank}</span>
              {p.player_name}
            </button>
          );
        })}
      </div>

      {/* Active Player Dossier Summary Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold font-mono text-lg text-brand-pink">
            #{selectedPlayer.rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">
                {selectedPlayer.player_name}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-100 text-brand-pink">
                {selectedPlayer.tier}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Player ID: {selectedPlayer.player_id} &middot; Role: {selectedPlayer.role.toUpperCase()} &middot; Sample: {selectedPlayer.n_pressure_deliveries} pressure balls
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Final Displayed Rating
            </div>
            <div className="text-2xl font-extrabold font-mono text-brand-pink">
              {selectedPlayer.rating.toFixed(2)}
            </div>
          </div>
          <Link
            to={`/player/${selectedPlayer.player_id}`}
            className="px-3.5 py-1.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            Full Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4-Stage Calculation Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stage 1: Raw Pressure Components */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-mono font-bold text-slate-400">STAGE 01</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
              Raw Sample
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-xs">Observed Deliveries</h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>N Deliveries:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.n_pressure_deliveries}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>N Effective:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.neff_pressure?.toFixed(1) ?? selectedPlayer.n_pressure_deliveries}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Raw PV / 100:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.PV?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Clutch Delta:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.CD?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Consistency (PC):</span>
              <span className="font-bold text-slate-800">{selectedPlayer.PC?.toFixed(2) ?? '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Stage 2: Empirical Bayes Shrinkage */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-mono font-bold text-slate-400">STAGE 02</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
              EB Shrinkage
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-xs">Regularization</h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Prior &mu;:</span>
              <span className="font-bold text-slate-800">{priorMu.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Prior &tau;:</span>
              <span className="font-bold text-slate-800">{priorTau.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shrinkage B_i:</span>
              <span className="font-bold text-slate-800">{shrinkageB.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Weight on Prior:</span>
              <span className="font-bold text-slate-800">{(shrinkageB * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Weight on Data:</span>
              <span className="font-bold text-emerald-700">{((1 - shrinkageB) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Stage 3: Composite Score */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-mono font-bold text-slate-400">STAGE 03</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
              Weighting
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-xs">Standardized Composite</h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>PV_scaled (50%):</span>
              <span className="font-bold text-slate-800">{selectedPlayer.PV_scaled?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CD_scaled (35%):</span>
              <span className="font-bold text-slate-800">{selectedPlayer.CD_scaled?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PC_scaled (15%):</span>
              <span className="font-bold text-slate-800">{selectedPlayer.PC_scaled?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
              <span>Composite Z:</span>
              <span className="font-bold text-purple-700">{selectedPlayer.composite?.toFixed(3) ?? '0.000'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Scale [0, 100]:</span>
              <span className="font-bold text-brand-pink">{selectedPlayer.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stage 4: Uncertainty & Credible Interval */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-mono font-bold text-slate-400">STAGE 04</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Uncertainty
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-xs">Posterior Bounds</h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Point Estimate:</span>
              <span className="font-bold text-brand-pink">{selectedPlayer.rating.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CI90 Low:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.rating_ci90[0].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CI90 High:</span>
              <span className="font-bold text-slate-800">{selectedPlayer.rating_ci90[1].toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>P(Outperform):</span>
              <span className="font-bold text-emerald-700">{(selectedPlayer.p_outperform * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Rank CI90:</span>
              <span className="font-bold text-slate-800">#{selectedPlayer.rank_ci90[0]} &ndash; #{selectedPlayer.rank_ci90[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Narrative Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans">
        <span className="font-bold text-slate-800">Analytical Verification Summary: </span>
        {selectedPlayer.explanation}
      </div>
    </div>
  );
};

