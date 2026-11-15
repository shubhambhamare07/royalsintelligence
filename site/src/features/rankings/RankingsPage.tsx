import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { TierBadge } from '../../components/cricket/TierBadge';
import { IntervalBar } from '../../components/cricket/IntervalBar';
import { ConfidenceMeter } from '../../components/cricket/ConfidenceMeter';
import { RankingBanner } from '../../components/cricket/RankingBanner';
import { WhyThisRankDrawer } from '../../components/cricket/WhyThisRankDrawer';
import { Tooltip } from '../../components/ui/Tooltip';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { RankingsData, RankedPlayer } from '../../lib/data/types';
import { formatZScore, formatPerHundred, formatPercent } from '../../lib/format/numbers';
import { getPlayerFranchise, getPlayerNationality, getCountryFlag } from '../../lib/data/playerMetadata';

type SortField = 'rank' | 'rating' | 'PV' | 'CD' | 'PC' | 'n_pressure_deliveries';

export const RankingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<RankedPlayer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Active Role from path
  const activeRole: 'batters' | 'bowlers' = location.pathname.includes('bowlers')
    ? 'bowlers'
    : 'batters';

  useEffect(() => {
    async function loadRankingsData() {
      try {
        const [rData, pData] = await Promise.all([
          dataLoader.getRankings(),
          dataLoader.getPlayersIndex(),
        ]);
        setRankings(rData);
        canonicalRegistry.initialize(
          pData,
          rData.eligible_batters || rData.top_10_batters,
          rData.eligible_bowlers || rData.top_10_bowlers
        );
      } catch (err) {
        console.error('Failed to load rankings', err);
      } finally {
        setLoading(false);
      }
    }
    loadRankingsData();
  }, []);

  const handleRoleChange = (roleId: string) => {
    setPage(1);
    navigate(`/rankings/${roleId}`);
  };

  const rawList: RankedPlayer[] = useMemo(() => {
    if (!rankings) return [];
    if (activeRole === 'batters') {
      return rankings.eligible_batters || rankings.top_10_batters || [];
    } else {
      return rankings.eligible_bowlers || rankings.top_10_bowlers || [];
    }
  }, [rankings, activeRole]);

  // Filter and sort
  const filteredPlayers = useMemo(() => {
    let list = [...rawList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchesName = p.player_name.toLowerCase().includes(q);
        const matchesId = String(p.player_id).includes(q);
        const matchesTier = p.tier.toLowerCase().includes(q);
        const country = getPlayerNationality(p.player_id).toLowerCase();
        const matchesCountry = country.includes(q);
        const franchise = getPlayerFranchise(p.player_id);
        const matchesTeam = franchise?.short.toLowerCase().includes(q) || franchise?.name.toLowerCase().includes(q);
        return matchesName || matchesId || matchesTier || matchesCountry || matchesTeam;
      });
    }

    // Tier filter
    if (tierFilter !== 'ALL') {
      list = list.filter((p) => p.tier.toLowerCase() === tierFilter.toLowerCase());
    }

    // Sort
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return list;
  }, [rawList, searchQuery, tierFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank');
    }
    setPage(1);
  };

  // Pagination slice
  const totalItems = filteredPlayers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPlayers = useMemo(() => {
    return filteredPlayers.slice(startIndex, startIndex + pageSize);
  }, [filteredPlayers, startIndex, pageSize]);

  const openDrawer = (player: RankedPlayer) => {
    setSelectedPlayer(player);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Permanent Ranking Governance Ledger */}
      <RankingBanner
        modelVersion={rankings?.model_version || 'pressure-v1.1'}
        configHash={rankings?.config_hash}
        battersCount={rankings?.counts?.eligible_batters || 155}
        bowlersCount={rankings?.counts?.eligible_bowlers || 151}
      />

      {/* 2. Role Navigation Tabs & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <Tabs
          items={[
            { id: 'batters', label: 'Batting Rankings', badge: rankings?.counts?.eligible_batters || 155 },
            { id: 'bowlers', label: 'Bowling Rankings', badge: rankings?.counts?.eligible_bowlers || 151 },
          ]}
          activeId={activeRole}
          onChange={handleRoleChange}
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
          >
            <option value="ALL">All Tiers</option>
            <option value="Elite">Elite Tier</option>
            <option value="Proven">Proven Tier</option>
            <option value="Promising">Promising Tier</option>
            <option value="Developing">Developing Tier</option>
            <option value="Fringe">Fringe Tier</option>
          </select>

          {/* Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={`Filter ${activeRole} by name, ID, team...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-[#14213D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
            />
          </div>
        </div>
      </div>

      {/* 3. Authoritative Serial Ranking Table */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-[#14213D] text-white text-[10px] font-bold uppercase tracking-wider select-none sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors w-14 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rank</span>
                    {sortField === 'rank' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[220px]">Player Identity</th>
                <th
                  onClick={() => handleSort('rating')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800 transition-colors min-w-[150px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Rating (0–100)</span>
                    {sortField === 'rating' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3">Tier</th>
                <th
                  onClick={() => handleSort('PV')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip content="Pressure Value (PV): Net runs generated above baseline per 100 pressure balls (Leverage Index ≥ 1.5). Positive is favorable.">
                      <span className="cursor-help border-b border-dotted border-white/40">PV / 100b</span>
                    </Tooltip>
                    {sortField === 'PV' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CD')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip content="Clutch Delta (CD): Performance differential between high-pressure and unconstrained normal-phase deliveries. Positive means player elevates under pressure.">
                      <span className="cursor-help border-b border-dotted border-white/40">Clutch Delta</span>
                    </Tooltip>
                    {sortField === 'CD' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('PC')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip content="Pressure Consistency (PC): Hit rate (%) of delivering positive game impact across all qualifying high-pressure match appearances.">
                      <span className="cursor-help border-b border-dotted border-white/40">Consistency</span>
                    </Tooltip>
                    {sortField === 'PC' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('n_pressure_deliveries')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Information Exposure: Registered pressure balls (n) and effective sample size (n_eff). Threshold: n ≥ 60 balls.">
                      <span className="cursor-help border-b border-dotted border-white/40">Exposure</span>
                    </Tooltip>
                    {sortField === 'n_pressure_deliveries' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Analytical Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedPlayers.map((player) => {
                const isTop10 = player.rank <= 10;
                const medalColors =
                  player.rank === 1
                    ? 'bg-[#C6A15B] text-white ring-2 ring-[#C6A15B]/40 shadow-2xs'
                    : player.rank === 2
                    ? 'bg-slate-400 text-white shadow-2xs'
                    : player.rank === 3
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700';

                const country = getPlayerNationality(player.player_id);
                const flagSrc = getCountryFlag(country);
                const franchise = getPlayerFranchise(player.player_id);

                return (
                  <tr
                    key={player.player_id}
                    onClick={() => openDrawer(player)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isTop10 ? 'bg-white font-medium' : 'bg-slate-50/25'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black tabular-nums ${medalColors}`}
                      >
                        {player.rank}
                      </span>
                    </td>

                    {/* Player Identity: Avatar + Full Name + Franchise & Flag */}
                    <td className="py-3 px-4 font-semibold text-[#14213D]">
                      <div className="flex items-center gap-2.5">
                        <PlayerAvatar
                          playerId={player.player_id}
                          playerName={player.player_name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-slate-900 hover:text-[#E6007E] transition-colors">
                            {player.player_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="tabular-nums">ID: #{player.player_id}</span>
                            {flagSrc && (
                              <img
                                src={flagSrc}
                                alt={country}
                                className="w-3.5 h-2.5 object-cover rounded-2xs border border-slate-200"
                              />
                            )}
                            {franchise && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-600">{franchise.short}</span>
                                {franchise.note && (
                                  <span className="text-[8.5px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                    {franchise.note}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rating & Whisker */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-[#14213D] w-12 tabular-nums">
                          {player.rating.toFixed(2)}
                        </span>
                        <div className="w-20 hidden sm:block">
                          <IntervalBar point={player.rating} ci={player.rating_ci90} />
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-3 font-sans">
                      <TierBadge tier={player.tier} size="sm" />
                    </td>

                    {/* PV */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-xs text-[#14213D] tabular-nums">
                        {formatPerHundred(player.pressure_value * 100)}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        z: {formatZScore(player.PV_scaled)}
                      </div>
                    </td>

                    {/* CD */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-xs text-[#14213D] tabular-nums">
                        {formatPerHundred(player.CD * 100)}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        z: {formatZScore(player.CD_scaled)}
                      </div>
                    </td>

                    {/* PC */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-xs text-[#14213D] tabular-nums">
                        {formatPercent(player.PC)}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        z: {formatZScore(player.PC_scaled)}
                      </div>
                    </td>

                    {/* Exposure */}
                    <td className="py-3 px-4 text-center">
                      <ConfidenceMeter
                        nDeliveries={player.n_pressure_deliveries}
                        nEffective={player.neff_pressure}
                      />
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(player);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#E6007E] hover:text-white text-[11px] font-bold text-[#14213D] transition-colors"
                      >
                        Audit →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Showing <strong className="text-[#14213D] tabular-nums">{totalItems === 0 ? 0 : startIndex + 1}</strong>–
              <strong className="text-[#14213D] tabular-nums">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
              <strong className="text-[#14213D] tabular-nums">{totalItems}</strong> certified {activeRole}
            </span>

            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-[11px]">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded text-[#14213D]"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 text-xs font-semibold text-slate-700 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* 5. Slide-over "Why This Rank" Forensic Drawer */}
      <WhyThisRankDrawer
        player={selectedPlayer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
