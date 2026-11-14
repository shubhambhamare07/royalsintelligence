import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  HelpCircle,
  Info,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { SensitivitySummary, RankingsData } from '../../lib/data/types';
import { InclusionBarChart, InclusionItem } from '../../components/charts/InclusionBarChart';
import { Skeleton } from '../../components/ui/Skeleton';

export const LabPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivitySummary | null>(null);
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [roleFilter, setRoleFilter] = useState<'both' | 'batter' | 'bowler'>('both');

  useEffect(() => {
    async function loadLabData() {
      try {
        setLoading(true);
        const [sensData, rankData] = await Promise.all([
          dataLoader.getSensitivitySummary(),
          dataLoader.getRankings(),
        ]);
        setSensitivity(sensData);
        setRankings(rankData);
      } catch (err: any) {
        console.error('Failed to load sensitivity data:', err);
        setError(err.message || 'Error loading sensitivity lab data');
      } finally {
        setLoading(false);
      }
    }
    loadLabData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !sensitivity || !rankings) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
          <h2 className="font-bold text-lg mb-2">Sensitivity Lab Load Error</h2>
          <p className="text-sm">{error || 'Unable to load simulation summary data.'}</p>
        </div>
      </div>
    );
  }

  // Build inclusion lists mapped to canonical player identities
  const fragileBattersSet = new Set(sensitivity.fragile_picks_batters.map(String));
  const fragileBowlersSet = new Set(sensitivity.fragile_picks_bowlers.map(String));

  const batterItems: InclusionItem[] = rankings.top_10_batters.map((p) => {
    const pId = String(p.player_id);
    const prob = sensitivity.primary_top10_batters_inclusion_freq[pId] ?? 0;
    return {
      id: pId,
      name: p.player_name,
      rank: p.rank,
      rating: p.rating,
      prob,
      isFragile: fragileBattersSet.has(pId) || prob < 0.2,
    };
  });

  const bowlerItems: InclusionItem[] = rankings.top_10_bowlers.map((p) => {
    const pId = String(p.player_id);
    const prob = sensitivity.primary_top10_bowlers_inclusion_freq[pId] ?? 0;
    return {
      id: pId,
      name: p.player_name,
      rank: p.rank,
      rating: p.rating,
      prob,
      isFragile: fragileBowlersSet.has(pId) || prob < 0.2,
    };
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Label Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
          <Link to="/" className="hover:text-[#E6007E] transition-colors">ROYALS INTEL</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Analytics</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#E6007E] font-semibold">Sensitivity &amp; Robustness Lab</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14213D] text-white tracking-wider uppercase">
                RESEARCH LAB &middot; PHASE 05
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-50 text-[#E6007E] border border-pink-200 uppercase">
                TARGET NOISE PERTURBATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
              Sensitivity &amp; Robustness Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Stress-testing primary Top-10 rankings through 500 Monte Carlo simulation runs with target reconstruction perturbation (σ ≈ 3.6 runs). Quantifies rank stability and distinguishes robust anchors from volatile fringe picks.
            </p>
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start md:self-center">
            <button
              onClick={() => setRoleFilter('both')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'both'
                  ? 'bg-white text-[#14213D] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('batter')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'batter'
                  ? 'bg-white text-[#14213D] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Batters Only
            </button>
            <button
              onClick={() => setRoleFilter('bowler')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'bowler'
                  ? 'bg-white text-[#14213D] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bowlers Only
            </button>
          </div>
        </div>
      </div>

      {/* 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Simulation Replicates
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#14213D] mt-1">
              {sensitivity.n_simulations}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Target noise &sigma; = 3.6 runs
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#14213D]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Mean Batter Top-10 Overlap
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#14213D] mt-1">
              {(sensitivity.mean_bat_top10_overlap * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              2.89 / 10 cohort survival
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#E6007E] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Mean Bowler Top-10 Overlap
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#14213D] mt-1">
              {(sensitivity.mean_bowl_top10_overlap * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              2.15 / 10 cohort survival
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quantitative Risk Disclosure Banner */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-amber-900">Quantitative Risk Disclosure:</span> The primary Top 10 rankings represent the point estimate under the baseline reconstructed target totals. In our 500-run perturbation test, several players who appear in the primary Top 10 fall below rank #10 in more than 80% of perturbed runs ({sensitivity.fragile_picks_batters.length} batters, {sensitivity.fragile_picks_bowlers.length} bowlers). When bidding at auction, discount fragile picks or treat their tier as conditional on target match context.
        </div>
      </div>

      {/* Top-10 Survival Probability Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(roleFilter === 'both' || roleFilter === 'batter') && (
          <div className="space-y-4">
            <InclusionBarChart
              items={batterItems}
              title="Primary Batters: Top-10 Survival Probability"
              role="batter"
              totalSimulations={sensitivity.n_simulations}
            />
          </div>
        )}

        {(roleFilter === 'both' || roleFilter === 'bowler') && (
          <div className="space-y-4">
            <InclusionBarChart
              items={bowlerItems}
              title="Primary Bowlers: Top-10 Survival Probability"
              role="bowler"
              totalSimulations={sensitivity.n_simulations}
            />
          </div>
        )}
      </div>

      {/* Methodological Insights Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#E6007E]" />
          Methodological Insights: Why Is Top-10 Overlap 20%–30%?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Tight Rating Density Around Ranks #5–#20</h4>
            <p>
              In both batting and bowling cohorts, ratings between rank #5 and rank #20 differ by less than 1.5 rating points (e.g. 78.5 vs 80.0). A minute &plusmn;3.6 run noise in the first-innings target reconstruction shifts individual ball leverage index by &sim;0.1&times;, which easily reorders adjacent players across the arbitrary #10 cutoff boundary.
            </p>
            <p>
              This is not a defect of the model; it is an honest reflection of empirical rank uncertainty. True analytical decision-makers buy across <b>Tiers (Elite, Proven, Promising)</b> rather than paying irrational auction premiums for rank #8 vs rank #12.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Robust Anchors vs High-Variance Stars</h4>
            <p>
              Notice that players with large delivery samples under high pressure exhibit high inclusion consistency, while low-volume or volatile match-winners shift depending on exact target reconstructions.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
              <div><strong className="text-slate-800">Batters Fragile Set:</strong> Dinesh Karthik, Shashank Singh, Kusal Mendis, Jitesh Sharma, Daryl Mitchell, Rashid Khan</div>
              <div><strong className="text-slate-800">Bowlers Fragile Set:</strong> Bhuvneshwar Kumar, Josh Hazlewood, Pat Cummins, Axar Patel, Kuldeep Yadav, Rasikh Salam, Nathan Ellis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
