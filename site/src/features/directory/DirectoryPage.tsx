import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { PlayerDirectoryItem, RankingsData, RankedPlayer } from '../../lib/data/types';
import { IPL_TEAMS } from '../../lib/data/teams';
import { getPlayerFranchise, getPlayerNationality, getCountryFlag } from '../../lib/data/playerMetadata';

type SortOption =
  | 'rank'
  | 'rating-desc'
  | 'rating-asc'
  | 'name-asc'
  | 'name-desc'
  | 'matches-desc'
  | 'balls-desc'
  | 'id-asc';

export const DirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerDirectoryItem[]>(() => dataLoader.getCachedDirectory() || []);
  const [rankings, setRankings] = useState<RankingsData | null>(() => dataLoader.getCachedRankings() || null);
  const [loading, setLoading] = useState(() => !dataLoader.getCachedDirectory());

  // Filters from URL
  const query = searchParams.get('q') || '';
  const roleFilter = searchParams.get('role') || 'ALL';
  const teamFilter = searchParams.get('team') || 'ALL';
  const countryFilter = searchParams.get('country') || 'ALL';
  const qualifiedOnly = searchParams.get('qualified') === 'true';
  const sort = (searchParams.get('sort') as SortOption) || 'rank';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

  useEffect(() => {
    async function loadDirectory() {
      try {
        const [pData, rData] = await Promise.all([
          dataLoader.getPlayersIndex(),
          dataLoader.getRankings(),
        ]);
        setPlayers(pData);
        setRankings(rData);
        canonicalRegistry.initialize(
          pData,
          rData.eligible_batters || rData.top_10_batters,
          rData.eligible_bowlers || rData.top_10_bowlers
        );
      } catch (err) {
        console.error('Failed to load player directory', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'ALL' || value === '' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  // Distinct countries for filter
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      const country = getPlayerNationality(p.player_id, p.national_teams);
      if (country && country !== 'Unknown' && country !== 'International') {
        set.add(country);
      }
    });
    return Array.from(set).sort();
  }, [players]);

  // Helper to determine player active rank based on context/roleFilter
  const getPlayerActiveRank = (
    playerId: string | number,
    role: string
  ): { primaryRank: RankedPlayer | null; secondaryRank: RankedPlayer | null } => {
    const batRank = canonicalRegistry.getBattingRank(playerId) || null;
    const bowlRank = canonicalRegistry.getBowlingRank(playerId) || null;

    if (role === 'BAT') {
      return {
        primaryRank: batRank || bowlRank,
        secondaryRank: batRank ? bowlRank : null,
      };
    }
    if (role === 'BOWL') {
      return {
        primaryRank: bowlRank || batRank,
        secondaryRank: bowlRank ? batRank : null,
      };
    }

    // For ALL or ALL_ROUNDER: pick the strongest / numerically lower rank
    if (batRank && bowlRank) {
      if (batRank.rank < bowlRank.rank) {
        return { primaryRank: batRank, secondaryRank: bowlRank };
      } else if (bowlRank.rank < batRank.rank) {
        return { primaryRank: bowlRank, secondaryRank: batRank };
      } else {
        return batRank.rating >= bowlRank.rating
          ? { primaryRank: batRank, secondaryRank: bowlRank }
          : { primaryRank: bowlRank, secondaryRank: batRank };
      }
    }

    return {
      primaryRank: batRank || bowlRank,
      secondaryRank: null,
    };
  };

  // Filtered and sorted players
  const processedPlayers = useMemo(() => {
    let list = players.filter((p) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesId = String(p.player_id).includes(q);
        const nat = getPlayerNationality(p.player_id, p.national_teams).toLowerCase();
        const matchesCountry = nat.includes(q);
        const franchise = getPlayerFranchise(p.player_id, p.franchise_teams);
        const matchesFranchise =
          franchise?.name.toLowerCase().includes(q) ||
          franchise?.short.toLowerCase().includes(q) ||
          Boolean(franchise?.note && franchise.note.toLowerCase().includes(q));
        const matchesTeams = p.teams?.some((t) => t.toLowerCase().includes(q));
        const matchesFranchiseTeams = p.franchise_teams?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesCountry && !matchesFranchise && !matchesTeams && !matchesFranchiseTeams) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== 'ALL') {
        const hasBatRank = Boolean(canonicalRegistry.getBattingRank(p.player_id));
        const hasBowlRank = Boolean(canonicalRegistry.getBowlingRank(p.player_id));

        if (roleFilter === 'BAT') {
          const isBatter = p.derived_role === 'BAT' || p.derived_role === 'WK' || p.derived_role === 'ALL' || hasBatRank;
          if (!isBatter) return false;
        } else if (roleFilter === 'BOWL') {
          const isBowler = p.derived_role === 'BOWL' || p.derived_role === 'ALL' || hasBowlRank;
          if (!isBowler) return false;
        } else if (roleFilter === 'ALL_ROUNDER') {
          const isAllRounder = p.derived_role === 'ALL' || (hasBatRank && hasBowlRank);
          if (!isAllRounder) return false;
        }
      }

      // Team filter
      if (teamFilter !== 'ALL') {
        const filterLower = teamFilter.toLowerCase();
        const franchise = getPlayerFranchise(p.player_id, p.franchise_teams);
        const selectedBranding = IPL_TEAMS[teamFilter];
        const selectedShort = selectedBranding?.short_name.toLowerCase();

        const matchesFranchiseName = franchise?.name.toLowerCase() === filterLower;
        const matchesFranchiseShort =
          franchise?.short.toLowerCase() === filterLower ||
          (Boolean(selectedShort) && franchise?.short.toLowerCase() === selectedShort);
        const matchesNote = Boolean(franchise?.note && franchise.note.toLowerCase().includes(filterLower));

        const inTeams = p.teams?.some(
          (t) => t.toLowerCase() === filterLower || (Boolean(selectedShort) && t.toLowerCase() === selectedShort)
        );
        const inFranchiseTeams = p.franchise_teams?.some(
          (t) => t.toLowerCase() === filterLower || (Boolean(selectedShort) && t.toLowerCase() === selectedShort)
        );

        if (!matchesFranchiseName && !matchesFranchiseShort && !matchesNote && !inTeams && !inFranchiseTeams) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== 'ALL') {
        const country = getPlayerNationality(p.player_id, p.national_teams);
        if (country !== countryFilter) return false;
      }

      // Qualified filter
      if (qualifiedOnly) {
        const batRank = canonicalRegistry.getBattingRank(p.player_id);
        const bowlRank = canonicalRegistry.getBowlingRank(p.player_id);
        if (!batRank && !bowlRank) return false;
      }

      return true;
    });

    // Sort
    list.sort((a, b) => {
      const { primaryRank: qualA } = getPlayerActiveRank(a.player_id, roleFilter);
      const { primaryRank: qualB } = getPlayerActiveRank(b.player_id, roleFilter);

      switch (sort) {
        case 'rank': {
          if (qualA && qualB) {
            if (qualA.rank !== qualB.rank) return qualA.rank - qualB.rank;
            return qualB.rating - qualA.rating;
          }
          if (qualA) return -1;
          if (qualB) return 1;
          return a.name.localeCompare(b.name);
        }
        case 'rating-desc': {
          const rA = qualA ? qualA.rating : -1;
          const rB = qualB ? qualB.rating : -1;
          return rB - rA;
        }
        case 'rating-asc': {
          const rA = qualA ? qualA.rating : 999;
          const rB = qualB ? qualB.rating : 999;
          return rA - rB;
        }
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'matches-desc':
          return b.matches_played - a.matches_played;
        case 'balls-desc': {
          const ballsA = (a.balls_faced || 0) + (a.deliveries_bowled || 0);
          const ballsB = (b.balls_faced || 0) + (b.deliveries_bowled || 0);
          return ballsB - ballsA;
        }
        case 'id-asc':
          return Number(a.player_id) - Number(b.player_id);
        default:
          return 0;
      }
    });

    return list;
  }, [players, query, roleFilter, teamFilter, countryFilter, qualifiedOnly, sort]);

  // Pagination calculation
  const totalItems = processedPlayers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedPlayers.slice(start, start + pageSize);
  }, [processedPlayers, currentPage, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#14213D] tracking-tight font-sans flex items-center gap-2">
            <Users className="w-6 h-6 text-[#E6007E]" />
            <span>Master Player Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Comprehensive serial intelligence archive of all {players.length} registered players across 883 T20 matches.
          </p>
        </div>

        {/* Total Summary Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span>Total Database:</span>
          <span className="font-bold text-[#14213D] tabular-nums">{players.length}</span>
          <span className="text-slate-300">|</span>
          <span>Certified Qualified:</span>
          <span className="font-bold text-[#E6007E] tabular-nums">
            {(rankings?.counts?.eligible_batters || 155) + (rankings?.counts?.eligible_bowlers || 151)}
          </span>
        </div>
      </div>

      {/* 2. Search & Multi-Filter Control Bar */}
      <Card className="p-3.5 space-y-3 border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by name, canonical ID, franchise, or country..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#14213D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30 focus:border-[#E6007E]"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => updateParam('role', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
            >
              <option value="ALL">All Roles</option>
              <option value="BAT">Batters Only</option>
              <option value="BOWL">Bowlers Only</option>
              <option value="ALL_ROUNDER">All-rounders</option>
            </select>
          </div>

          {/* Franchise Filter */}
          <div>
            <select
              value={teamFilter}
              onChange={(e) => updateParam('team', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
            >
              <option value="ALL">All Franchises</option>
              {Object.keys(IPL_TEAMS).map((teamName) => (
                <option key={teamName} value={teamName}>
                  {teamName}
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={countryFilter}
              onChange={(e) => updateParam('country', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
            >
              <option value="ALL">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lower Filter Controls: Qualified Toggle, Sort, and Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateParam('qualified', (!qualifiedOnly).toString())}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                qualifiedOnly
                  ? 'bg-[#14213D] text-white border-[#14213D]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>Certified Qualified Only (n ≥ 60 balls)</span>
            </button>

            {/* Clear All Filters */}
            {(query || roleFilter !== 'ALL' || teamFilter !== 'ALL' || countryFilter !== 'ALL' || qualifiedOnly) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-[#E6007E] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort & Pagination Size Control */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-[#14213D] focus:outline-none focus:ring-1 focus:ring-[#E6007E]"
              >
                <option value="rank">Role Rank (Certified First)</option>
                <option value="rating-desc">Highest Pressure Rating</option>
                <option value="rating-asc">Lowest Pressure Rating</option>
                <option value="name-asc">Player Name (A–Z)</option>
                <option value="name-desc">Player Name (Z–A)</option>
                <option value="matches-desc">Career Matches</option>
                <option value="balls-desc">Balls Faced / Bowled</option>
                <option value="id-asc">Canonical ID</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-[11px] font-medium">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => updateParam('pageSize', e.target.value)}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-[#14213D] focus:outline-none focus:ring-1 focus:ring-[#E6007E]"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Showing <strong className="text-[#14213D] tabular-nums">{totalItems === 0 ? 0 : startIndex + 1}</strong>–
              <strong className="text-[#14213D] tabular-nums">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
              <strong className="text-[#14213D] tabular-nums">{totalItems}</strong> players
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Dedicated Serial Player Table (NO CARD GRID) */}
      {processedPlayers.length === 0 ? (
        <EmptyState
          title="No players match the selected criteria"
          description="Try broadening your search term or clearing role, team, or qualification filters."
          actionLabel="Reset All Filters"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-[#14213D] text-white text-[10px] font-bold uppercase tracking-wider select-none sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Player</th>
                  <th className="py-2.5 px-2.5 text-center w-20">Player ID</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Country</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Franchise</th>
                  <th className="py-2.5 px-2.5 text-center">Role</th>
                  <th className="py-2.5 px-2.5 text-center">Batting</th>
                  <th className="py-2.5 px-2.5 min-w-[110px]">Bowling</th>
                  <th className="py-2.5 px-2.5 text-right">Matches</th>
                  <th className="py-2.5 px-2.5 text-right">Balls</th>
                  <th className="py-2.5 px-3 text-right min-w-[110px]">Pressure Rating</th>
                  <th className="py-2.5 px-2.5 text-center">Rank</th>
                  <th className="py-2.5 px-2.5 text-center">Confidence</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPlayers.map((player, idx) => {
                  const serialNumber = startIndex + idx + 1;
                  const { primaryRank: qualifiedRank, secondaryRank } = getPlayerActiveRank(
                    player.player_id,
                    roleFilter
                  );

                  const country = getPlayerNationality(player.player_id, player.national_teams);
                  const flagSrc = getCountryFlag(country);
                  const franchise = getPlayerFranchise(player.player_id, player.franchise_teams);

                  const totalBalls =
                    player.derived_role === 'BAT'
                      ? player.balls_faced || 0
                      : player.derived_role === 'BOWL'
                      ? player.deliveries_bowled || 0
                      : (player.balls_faced || 0) + (player.deliveries_bowled || 0);

                  const confidenceTier = qualifiedRank
                    ? qualifiedRank.n_pressure_deliveries >= 200
                      ? 'High'
                      : qualifiedRank.n_pressure_deliveries >= 80
                      ? 'Medium'
                      : 'Low'
                    : 'Unrated';

                  return (
                    <tr
                      key={player.player_id}
                      onClick={() => navigate(`/player/${player.player_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Serial Number */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-semibold tabular-nums text-[11px]">
                        {serialNumber}
                      </td>

                      {/* Player: Authentic Avatar + Full Name */}
                      <td className="py-2.5 px-3 font-semibold text-[#14213D]">
                        <div className="flex items-center gap-2.5">
                          <PlayerAvatar
                            playerId={player.player_id}
                            playerName={player.name}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 group-hover:text-[#E6007E] transition-colors truncate block">
                              {player.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {player.derived_role === 'ALL' ? 'All-rounder' : player.derived_role === 'BAT' ? 'Top-order Batter' : 'Bowler'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Canonical Player ID */}
                      <td className="py-2.5 px-2.5 text-center text-slate-500 tabular-nums font-medium text-[11px]">
                        #{player.player_id}
                      </td>

                      {/* Country: Flag + Label */}
                      <td className="py-2.5 px-3 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          {flagSrc && (
                            <img
                              src={flagSrc}
                              alt={country}
                              className="w-4 h-3 object-cover rounded-2xs border border-slate-200 shrink-0"
                            />
                          )}
                          <span className="truncate text-xs">{country}</span>
                        </div>
                      </td>

                      {/* Franchise: Logo + Code + Contextual Trade Note */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {franchise ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <img
                              src={franchise.logo}
                              alt={franchise.short}
                              className="h-4 w-4 object-contain shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="font-semibold text-xs text-slate-800">{franchise.short}</span>
                            {franchise.note && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 shrink-0 leading-none">
                                {franchise.note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            player.derived_role === 'BAT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : player.derived_role === 'BOWL'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {player.derived_role}
                        </span>
                      </td>

                      {/* Batting Style */}
                      <td className="py-2.5 px-2.5 text-center text-slate-600 text-[11px]">
                        {player.batting_hand || '—'}
                      </td>

                      {/* Bowling Style */}
                      <td className="py-2.5 px-2.5 text-slate-600 text-[11px] truncate max-w-[120px]" title={player.bowling_type || ''}>
                        {player.bowling_type || '—'}
                      </td>

                      {/* Matches */}
                      <td className="py-2.5 px-2.5 text-right font-medium text-slate-700 tabular-nums text-xs">
                        {player.matches_played}
                      </td>

                      {/* Balls */}
                      <td className="py-2.5 px-2.5 text-right font-medium text-slate-700 tabular-nums text-xs">
                        {totalBalls}b
                      </td>

                      {/* Pressure Rating */}
                      <td className="py-2.5 px-3 text-right">
                        {qualifiedRank ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="font-bold text-xs text-[#E6007E] tabular-nums">
                              {qualifiedRank.rating.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-400 tabular-nums">
                              [{qualifiedRank.rating_ci90[0].toFixed(1)}, {qualifiedRank.rating_ci90[1].toFixed(1)}]
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Rank */}
                      <td className="py-2.5 px-2.5 text-center">
                        {qualifiedRank ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-[#14213D] text-white font-bold text-[10px] tabular-nums shadow-2xs">
                              #{qualifiedRank.rank} {qualifiedRank.role === 'batter' ? 'BAT' : 'BOWL'}
                            </span>
                            {secondaryRank && (
                              <span className="text-[8.5px] font-semibold text-slate-500 tabular-nums">
                                #{secondaryRank.rank} {secondaryRank.role === 'batter' ? 'BAT' : 'BOWL'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            confidenceTier === 'High'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : confidenceTier === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : confidenceTier === 'Low'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {confidenceTier}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 text-center">
                        {qualifiedRank ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Certified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-500">
                            Unrated
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/player/${player.player_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#E6007E] hover:text-white text-slate-800 text-[11px] font-semibold transition-colors"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Complete Serial Pagination Controls */}
          <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing <strong className="text-[#14213D] tabular-nums">{startIndex + 1}</strong> to{' '}
              <strong className="text-[#14213D] tabular-nums">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
              <strong className="text-[#14213D] tabular-nums">{totalItems}</strong> entries
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => updateParam('page', '1')}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => updateParam('page', String(currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page Number Indicators */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParam('page', String(pageNum))}
                      className={`w-7 h-7 rounded text-xs font-semibold tabular-nums transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#14213D] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => updateParam('page', String(currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => updateParam('page', String(totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
