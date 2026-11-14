import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Crosshair,
  ExternalLink,
  Filter,
  HelpCircle,
  Info,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { dataLoader } from '../../lib/data/loaders';
import { Skeleton } from '../../components/ui/Skeleton';

export interface AnomalyRecord {
  player_id: number | string;
  player_name: string;
  role: 'batter' | 'bowler' | string;
  match_id: number;
  n_balls: number;
  match_runs_conceded?: number;
  match_runs?: number;
  match_wickets?: number;
  match_pressure_value: number;
  career_expected_value: number;
  z_score: number;
  direction: 'positive' | 'negative';
}

export interface AnomaliesData {
  model_version: string;
  threshold: number;
  counts: {
    total_anomalies: number;
    batter_anomalies: number;
    bowler_anomalies: number;
  };
  top_20_anomalies: AnomalyRecord[];
}

export const AnomaliesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnomaliesData | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'batter' | 'bowler'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [search, setSearch] = useState('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRecord | null>(null);

  useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        const anomData = await dataLoader.getAnomalies();
        setData(anomData);
        if (anomData.top_20_anomalies.length > 0) {
          setSelectedAnomaly(anomData.top_20_anomalies[0]);
        }
      } catch (err) {
        console.error('Failed to load anomaly data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  const filteredList = useMemo(() => {
    if (!data) return [];
    return data.top_20_anomalies.filter((a) => {
      const matchRole = roleFilter === 'all' || a.role === roleFilter;
      const matchDir = directionFilter === 'all' || a.direction === directionFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.player_name.toLowerCase().includes(q) ||
        String(a.match_id).includes(q) ||
        String(a.player_id).includes(q);

      return matchRole && matchDir && matchSearch;
    });
  }, [data, roleFilter, directionFilter, search]);

  // Scatter plot options: Career Expected vs Observed Match Pressure Value
  const scatterOption = useMemo(() => {
    if (!data) return null;
    const seriesData = data.top_20_anomalies.map((a) => ({
      name: a.player_name,
      value: [a.career_expected_value, a.match_pressure_value, a.z_score, a.player_name, a],
      itemStyle: {
        color: a.direction === 'positive' ? '#10B981' : '#EF4444',
        borderColor: '#FFFFFF',
        borderWidth: 1.5,
      },
      symbolSize: Math.max(10, Math.min(24, Math.abs(a.z_score) * 2.5)),
    }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#14213D',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (params: any) => {
          const a: AnomalyRecord = params.value[4];
          if (!a) return '';
          return `
            <div style="font-weight: 700; color: #FFFFFF;">${a.player_name} (${a.role.toUpperCase()})</div>
            <div style="font-family: monospace; font-size: 11px; margin-top: 3px; line-height: 1.6;">
              <div>Match ID: #${a.match_id} (${a.n_balls} balls)</div>
              <div>Observed PV: <b>${a.match_pressure_value.toFixed(4)}</b></div>
              <div>Career Expected: <b>${a.career_expected_value.toFixed(4)}</b></div>
              <div style="color: ${a.direction === 'positive' ? '#34D399' : '#F87171'}; font-weight: bold;">
                Z-Score: ${a.z_score > 0 ? '+' : ''}${a.z_score.toFixed(2)} &sigma; (${a.direction.toUpperCase()})
              </div>
            </div>
          `;
        },
      },
      grid: {
        top: 30,
        right: 30,
        bottom: 50,
        left: 55,
      },
      xAxis: {
        type: 'value',
        name: 'Career Expected Value (E[V])',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontFamily: 'monospace' },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      yAxis: {
        type: 'value',
        name: 'Match Observed Pressure Value',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: { color: '#64748B', fontSize: 11, fontWeight: 600 },
        axisLine: { lineStyle: { color: '#CBD5E1' } },
        axisLabel: { color: '#64748B', fontFamily: 'monospace' },
        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      },
      series: [
        {
          type: 'scatter',
          data: seriesData,
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#94A3B8', type: 'dashed' },
            data: [{ type: 'average', name: 'Avg Expected' }],
          },
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14213D] text-white">
              MODEL RESIDUALS &middot; PHASE 04
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
              OUTLIER DIAGNOSTICS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Crosshair className="w-7 h-7 text-purple-600" />
            Anomaly &amp; Model Residual Detection
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Inspecting match performances that deviate substantially (|Z| &ge; 2.5&sigma;) from career Bayesian baseline expectations. Distinguishes singular clutch heroics from extreme downside match collapses.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Flagged Match Outliers
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {data.counts.total_anomalies.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Across 883 analyzed match histories
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Batting Residual Flags
          </div>
          <div className="text-3xl font-extrabold font-mono text-brand-pink mt-1">
            {data.counts.batter_anomalies.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Threshold: |Z| &ge; {data.threshold.toFixed(1)}&sigma;
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Bowling Residual Flags
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-600 mt-1">
            {data.counts.bowler_anomalies.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Threshold: |Z| &ge; {data.threshold.toFixed(1)}&sigma;
          </div>
        </div>
      </div>

      {/* Scatter Matrix Card: Career Expected vs Observed Match Value */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Residual Scatter: Career Expected Value vs Match Observed Value
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Green bubbles denote positive clutch outliers (|Z| &ge; 2.5&sigma;); Red bubbles denote negative clutch collapses.
            </p>
          </div>
        </div>
        {scatterOption && (
          <ReactECharts
            option={scatterOption}
            style={{ height: '360px', width: '100%' }}
            onEvents={{
              click: (params: any) => {
                if (params.data?.value?.[4]) {
                  setSelectedAnomaly(params.data.value[4]);
                }
              },
            }}
          />
        )}
      </div>

      {/* Filter and Search Bar for Anomaly Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('batter')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'batter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Batters
            </button>
            <button
              onClick={() => setRoleFilter('bowler')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                roleFilter === 'bowler' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bowlers
            </button>
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                directionFilter === 'all' ? 'bg-[#14213D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Outliers
            </button>
            <button
              onClick={() => setDirectionFilter('positive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                directionFilter === 'positive'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Positive Overperformance
            </button>
            <button
              onClick={() => setDirectionFilter('negative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                directionFilter === 'negative'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Negative Collapses
            </button>
          </div>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by player or match ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
      </div>

      {/* Detailed Top 20 Anomalies Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Match ID</th>
                <th className="py-3 px-4 text-right">Balls</th>
                <th className="py-3 px-4 text-right">Match Performance</th>
                <th className="py-3 px-4 text-right">Observed PV</th>
                <th className="py-3 px-4 text-right">Career Expected</th>
                <th className="py-3 px-4 text-right">Z-Score</th>
                <th className="py-3 px-4 text-center">Direction</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredList.map((a, idx) => (
                <tr
                  key={`${a.player_id}-${a.match_id}-${idx}`}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    <Link to={`/player/${a.player_id}`} className="hover:text-brand-pink transition-colors">
                      {a.player_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] text-slate-600 font-bold">
                    {a.role}
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/match/${a.match_id}`} className="text-blue-600 hover:underline">
                      #{a.match_id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">{a.n_balls}</td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {a.role === 'bowler'
                      ? `${a.match_wickets || 0} wkts (${a.match_runs_conceded || 0}r)`
                      : `${a.match_runs || 0} runs`}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {a.match_pressure_value.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {a.career_expected_value.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        a.z_score > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {a.z_score > 0 ? '+' : ''}
                      {a.z_score.toFixed(2)}&sigma;
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[10px] uppercase">
                    {a.direction === 'positive' ? (
                      <span className="text-emerald-700 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Clutched
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center justify-center gap-1">
                        <TrendingDown className="w-3 h-3" /> Collapsed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/match/${a.match_id}`}
                      className="text-brand-pink font-sans font-bold hover:underline text-[11px]"
                    >
                      Inspect Replay &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Neutral Interpretation Disclosure */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-500" /> Neutral Diagnostic Interpretation Guidance:
        </div>
        <p>
          Anomalous observations do not represent model defect or player illegitimacy. In statistical cricket modeling, extreme residuals point to singular high-leverage events (e.g. game-turning 4-wicket death spells or unfortunate first-ball run-outs). All observations are modeled neutrally without subjective adjustments.
        </p>
      </div>
    </div>
  );
};

