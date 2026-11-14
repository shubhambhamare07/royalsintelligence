import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart2,
  CheckCircle,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Layers,
  Search,
  Shuffle,
  Zap,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { TransferabilityData, TransferabilityPoint, TransferabilityDomain } from '../../lib/data/types';
import { TransferabilityScatterChart } from '../../components/charts/TransferabilityScatterChart';
import { Skeleton } from '../../components/ui/Skeleton';

export const TransferabilityPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferData, setTransferData] = useState<TransferabilityData | null>(null);
  const [role, setRole] = useState<'batter' | 'bowler'>('batter');
  const [selectedPoint, setSelectedPoint] = useState<TransferabilityPoint | null>(null);
  const [search, setSearch] = useState('');
  const [quadrantFilter, setQuadrantFilter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await dataLoader.getTransferabilityData();
        setTransferData(data);
        if (data.batter_transferability.scatter_points.length > 0) {
          setSelectedPoint(data.batter_transferability.scatter_points[0]);
        }
      } catch (err: any) {
        console.error('Failed to load transferability data:', err);
        setError(err.message || 'Error loading transferability data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeDomain: TransferabilityDomain | null = useMemo(() => {
    if (!transferData) return null;
    return role === 'batter'
      ? transferData.batter_transferability
      : transferData.bowler_transferability;
  }, [transferData, role]);

  // Medians for quadrant calculation
  const medians = useMemo(() => {
    if (!activeDomain) return { ipl: 0.5, t20i: 0.5 };
    const iplArr = [...activeDomain.scatter_points].map((p) => p.ipl_value).sort((a, b) => a - b);
    const t20Arr = [...activeDomain.scatter_points].map((p) => p.t20i_value).sort((a, b) => a - b);
    return {
      ipl: iplArr[Math.floor(iplArr.length / 2)] || 0.5,
      t20i: t20Arr[Math.floor(t20Arr.length / 2)] || 0.5,
    };
  }, [activeDomain]);

  // Classify points into 4 quadrants
  const classifiedPoints = useMemo(() => {
    if (!activeDomain) return [];
    return activeDomain.scatter_points.map((p) => {
      let q: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q3';
      if (p.ipl_value >= medians.ipl && p.t20i_value >= medians.t20i) q = 'Q1';
      else if (p.ipl_value < medians.ipl && p.t20i_value >= medians.t20i) q = 'Q2';
      else if (p.ipl_value < medians.ipl && p.t20i_value < medians.t20i) q = 'Q3';
      else q = 'Q4';
      return { ...p, quadrant: q };
    });
  }, [activeDomain, medians]);

  // Filtered list
  const filteredList = useMemo(() => {
    return classifiedPoints.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.player_name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.player_id).includes(search);
      const matchQuadrant = quadrantFilter === 'all' || p.quadrant === quadrantFilter;
      return matchSearch && matchQuadrant;
    });
  }, [classifiedPoints, search, quadrantFilter]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error || !transferData || !activeDomain) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
          <h2 className="font-bold text-lg mb-2">Transferability Load Error</h2>
          <p className="text-sm">{error || 'Unable to load transferability data.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14213D] text-white">
              CROSS-COMPETITION RESEARCH &middot; PHASE 04
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
              IPL VS T20I TRANSFERABILITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cross-Competition Transferability Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Investigating whether clutch performance in international T20s translates to the Indian Premier League. Evaluates qualified players with &ge;60 pressure deliveries in both competitions.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => {
              setRole('batter');
              setSelectedPoint(transferData.batter_transferability.scatter_points[0] || null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              role === 'batter'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batters ({transferData.batter_transferability.n_qualified})
          </button>
          <button
            onClick={() => {
              setRole('bowler');
              setSelectedPoint(transferData.bowler_transferability.scatter_points[0] || null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              role === 'bowler'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bowlers ({transferData.bowler_transferability.n_qualified})
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Spearman Rank Correlation (&rho;)
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {activeDomain.spearman_rho.toFixed(4)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
            p-value = {activeDomain.p_value.toFixed(4)} {activeDomain.p_value < 0.05 ? '(Statistically Sig.)' : '(Not Sig.)'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            95% Bootstrap CI
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            [{activeDomain.ci95[0].toFixed(3)}, {activeDomain.ci95[1].toFixed(3)}]
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Strictly positive bounds confirm moderate transfer
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Disattenuated Correlation (&rho;_true)
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
            {activeDomain.rho_disattenuated.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Corrected for sample measurement noise
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Qualified Dual-Domain Sample
          </div>
          <div className="text-2xl font-extrabold font-mono text-brand-pink mt-1">
            {activeDomain.n_qualified} Players
          </div>
          <div className="text-xs text-slate-500 mt-1">
            &ge;{activeDomain.min_deliveries_threshold} pressure deliveries in both
          </div>
        </div>
      </div>

      {/* 4 Quadrants Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setQuadrantFilter(quadrantFilter === 'Q1' ? 'all' : 'Q1')}
          className={`p-4 rounded-xl text-left border transition-all ${
            quadrantFilter === 'Q1'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono text-emerald-800">
              Quadrant I
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
              {classifiedPoints.filter((p) => p.quadrant === 'Q1').length} Players
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1">Universal Clutch</div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Above median in both IPL & T20I. Highest auction bidding confidence.
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === 'Q2' ? 'all' : 'Q2')}
          className={`p-4 rounded-xl text-left border transition-all ${
            quadrantFilter === 'Q2'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono text-blue-800">
              Quadrant II
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
              {classifiedPoints.filter((p) => p.quadrant === 'Q2').length} Players
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1">International Specialist</div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            High T20I, low IPL. Watch for franchise tactical adaptation friction.
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === 'Q3' ? 'all' : 'Q3')}
          className={`p-4 rounded-xl text-left border transition-all ${
            quadrantFilter === 'Q3'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono text-rose-800">
              Quadrant III
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
              {classifiedPoints.filter((p) => p.quadrant === 'Q3').length} Players
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1">Dual Domain Fragile</div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Below median across both circuits. High auction downside risk.
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === 'Q4' ? 'all' : 'Q4')}
          className={`p-4 rounded-xl text-left border transition-all ${
            quadrantFilter === 'Q4'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono text-amber-800">
              Quadrant IV
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
              {classifiedPoints.filter((p) => p.quadrant === 'Q4').length} Players
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1">League Specialist</div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            High IPL clutch, modest T20I record. Thrives in subcontinental conditions.
          </p>
        </button>
      </div>

      {/* Main Scatter Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Quadrant Scatter Matrix: IPL Pressure vs T20I Pressure
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any bubble to inspect player confidence intervals and match exposures.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredList.length} of {activeDomain.n_qualified} players
            </span>
            {quadrantFilter !== 'all' && (
              <button
                onClick={() => setQuadrantFilter('all')}
                className="text-xs text-brand-pink font-semibold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        <TransferabilityScatterChart
          points={filteredList}
          role={role}
          selectedPlayerId={selectedPoint?.player_id}
          onSelectPlayer={(p) => setSelectedPoint(p)}
          height="480px"
        />
      </div>

      {/* Selected Player Dossier Card (if active) */}
      {selectedPoint && (
        <div className="p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-extrabold text-white">{selectedPoint.player_name}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-pink text-white">
                {selectedPoint.ipl_value >= medians.ipl && selectedPoint.t20i_value >= medians.t20i
                  ? 'Quadrant I: Universal Clutch'
                  : selectedPoint.ipl_value < medians.ipl && selectedPoint.t20i_value >= medians.t20i
                  ? 'Quadrant II: International Specialist'
                  : selectedPoint.ipl_value < medians.ipl && selectedPoint.t20i_value < medians.t20i
                  ? 'Quadrant III: Dual Domain Fragile'
                  : 'Quadrant IV: League Specialist'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">IPL Value:</span>
                <span className="font-bold text-white text-sm">{selectedPoint.ipl_value.toFixed(4)}</span>
                <span className="text-[10px] text-slate-400 block">[{selectedPoint.ipl_ci90[0].toFixed(3)}, {selectedPoint.ipl_ci90[1].toFixed(3)}]</span>
              </div>
              <div>
                <span className="text-slate-400 block">T20I Value:</span>
                <span className="font-bold text-white text-sm">{selectedPoint.t20i_value.toFixed(4)}</span>
                <span className="text-[10px] text-slate-400 block">[{selectedPoint.t20i_ci90[0].toFixed(3)}, {selectedPoint.t20i_ci90[1].toFixed(3)}]</span>
              </div>
              <div>
                <span className="text-slate-400 block">IPL Balls:</span>
                <span className="font-bold text-white text-sm">{selectedPoint.ipl_exposure}</span>
              </div>
              <div>
                <span className="text-slate-400 block">T20I Balls:</span>
                <span className="font-bold text-white text-sm">{selectedPoint.t20i_exposure}</span>
              </div>
            </div>
          </div>

          <Link
            to={`/player/${selectedPoint.player_id}`}
            className="px-4 py-2 rounded-lg bg-brand-pink text-white text-xs font-bold hover:bg-pink-600 transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            Open Player DNA <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Qualified Players Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              All {activeDomain.n_qualified} Qualified Dual-Domain {role === 'batter' ? 'Batters' : 'Bowlers'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered by: {quadrantFilter === 'all' ? 'All Quadrants' : quadrantFilter}
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Quadrant</th>
                <th className="py-3 px-4 text-right">IPL Pressure Value</th>
                <th className="py-3 px-4 text-right">T20I Pressure Value</th>
                <th className="py-3 px-4 text-right">IPL Balls</th>
                <th className="py-3 px-4 text-right">T20I Balls</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredList.map((p) => {
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (p.quadrant === 'Q1') badgeClass = 'bg-emerald-100 text-emerald-800';
                if (p.quadrant === 'Q2') badgeClass = 'bg-blue-100 text-blue-800';
                if (p.quadrant === 'Q3') badgeClass = 'bg-rose-100 text-rose-800';
                if (p.quadrant === 'Q4') badgeClass = 'bg-amber-100 text-amber-800';

                return (
                  <tr
                    key={p.player_id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPoint(p)}
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {p.player_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                        {p.quadrant}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-slate-800">{p.ipl_value.toFixed(4)}</span>
                      <span className="text-[10px] text-slate-400 block">
                        [{p.ipl_ci90[0].toFixed(3)}, {p.ipl_ci90[1].toFixed(3)}]
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-slate-800">{p.t20i_value.toFixed(4)}</span>
                      <span className="text-[10px] text-slate-400 block">
                        [{p.t20i_ci90[0].toFixed(3)}, {p.t20i_ci90[1].toFixed(3)}]
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{p.ipl_exposure}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{p.t20i_exposure}</td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/player/${p.player_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-brand-pink hover:underline font-sans font-semibold text-[11px]"
                      >
                        Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

