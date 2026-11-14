import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Filter,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Trophy,
  Zap,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { MatchIndexItem } from '../../lib/data/types';
import { Skeleton } from '../../components/ui/Skeleton';

export const MatchCentrePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchIndexItem[]>([]);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'ALL' | 'IPL' | 'T20I' | 'OTHER_T20'>('ALL');
  const [seasonFilter, setSeasonFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const data = await dataLoader.getMatchesIndex();
        setMatches(data);
      } catch (err: any) {
        console.error('Failed to load matches index:', err);
        setError(err.message || 'Error loading match index');
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  // Distinct seasons
  const seasons = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => {
      if (m.season) set.add(m.season);
    });
    return Array.from(set).sort().reverse();
  }, [matches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchKind = kindFilter === 'ALL' || m.kind === kindFilter;
      const matchSeason = seasonFilter === 'ALL' || m.season === seasonFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.home_team.toLowerCase().includes(q) ||
        m.away_team.toLowerCase().includes(q) ||
        m.comp_name.toLowerCase().includes(q) ||
        m.result.toLowerCase().includes(q) ||
        String(m.match_id).includes(q);

      return matchKind && matchSeason && matchSearch;
    });
  }, [matches, kindFilter, seasonFilter, search]);

  // Pagination slice
  const totalPages = Math.ceil(filteredMatches.length / pageSize) || 1;
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMatches.slice(start, start + pageSize);
  }, [filteredMatches, currentPage]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
          <h2 className="font-bold text-lg mb-2">Match Centre Load Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const iplCount = matches.filter((m) => m.kind === 'IPL').length;
  const t20iCount = matches.filter((m) => m.kind === 'T20I').length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14213D] text-white">
              MATCH ARCHIVE &middot; 2021&ndash;2024
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink-100 text-brand-pink border border-pink-200">
              BALL-BY-BALL LEVERAGE ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Match Centre & Ball-by-Ball Replay
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Explore 883 analyzed T20 fixtures with delivery-level win probability curves, dynamic leverage index tracking, and turning point detection.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Total Analyzed Matches
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            {matches.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Full state-space delivery history indexed
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            IPL Tournament Matches
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-700 mt-1">
            {iplCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Seasons 2021 through 2024
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            International T20 Matches
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-700 mt-1">
            {t20iCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bilateral series and ICC World Cups
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Competition Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setKindFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                kindFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => {
                setKindFilter('IPL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                kindFilter === 'IPL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IPL ({iplCount})
            </button>
            <button
              onClick={() => {
                setKindFilter('T20I');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                kindFilter === 'T20I'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              T20I ({t20iCount})
            </button>
            <button
              onClick={() => {
                setKindFilter('OTHER_T20');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                kindFilter === 'OTHER_T20'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Other T20 ({matches.filter((m) => m.kind === 'OTHER_T20').length})
            </button>
          </div>

          {/* Season Filter Dropdown */}
          <select
            value={seasonFilter}
            onChange={(e) => {
              setSeasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-pink"
          >
            <option value="ALL">All Seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                Season {s}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams, tournament, match ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedMatches.map((m) => {
          return (
            <div
              key={m.match_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header line */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        m.kind === 'IPL'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {m.kind} {m.season}
                    </span>
                    {m.quality_flags.is_dls && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800">
                        DLS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {m.match_date}
                  </span>
                </div>

                {/* Tournament title */}
                <div className="text-xs text-slate-500 font-medium truncate" title={m.comp_name}>
                  {m.comp_name}
                </div>

                {/* Teams Block */}
                <div className="space-y-1.5 py-1">
                  <div
                    className={`flex items-center justify-between text-sm ${
                      m.winner_team === m.home_team
                        ? 'font-extrabold text-slate-900'
                        : 'font-medium text-slate-600'
                    }`}
                  >
                    <span>{m.home_team}</span>
                    {m.winner_team === m.home_team && (
                      <Trophy className="w-3.5 h-3.5 text-brand-pink shrink-0" />
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-between text-sm ${
                      m.winner_team === m.away_team
                        ? 'font-extrabold text-slate-900'
                        : 'font-medium text-slate-600'
                    }`}
                  >
                    <span>{m.away_team}</span>
                    {m.winner_team === m.away_team && (
                      <Trophy className="w-3.5 h-3.5 text-brand-pink shrink-0" />
                    )}
                  </div>
                </div>

                {/* Result Narrative */}
                <div className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="truncate">{m.result}</span>
                  {m.reconstructed_totals && (
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2" title="Target Noise Sigma">
                      &plusmn;{m.reconstructed_totals.t1_sigma.toFixed(1)}r
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  ID: #{m.match_id}
                </span>
                <Link
                  to={`/match/${m.match_id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Match Replay
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600 font-mono">
        <div>
          Showing {filteredMatches.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredMatches.length)} of {filteredMatches.length} matches
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-bold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
