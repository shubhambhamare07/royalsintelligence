import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  X,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  RefreshCw,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { TierBadge } from '../../components/cricket/TierBadge';
import { RatingDisplay } from '../../components/cricket/RatingDisplay';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { DualRadarChart } from '../../components/charts/DualRadarChart';
import { MetricDeltaChart } from '../../components/charts/MetricDeltaChart';
import { Tooltip } from '../../components/ui/Tooltip';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { RankedPlayer, PlayerDirectoryItem } from '../../lib/data/types';
import { formatPerHundred, formatPercent } from '../../lib/format/numbers';
import { getPlayerFranchise, getPlayerNationality, getCountryFlag } from '../../lib/data/playerMetadata';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize synchronously from cache if already loaded
  const cachedRankings = dataLoader.getCachedRankings();
  const cachedDir = dataLoader.getCachedDirectory();
  const cachedDna = dataLoader.getCachedDna();

  const [rankedPlayers, setRankedPlayers] = useState<Map<string, RankedPlayer>>(() => {
    const map = new Map<string, RankedPlayer>();
    if (cachedRankings) {
      const allList = [
        ...(cachedRankings.eligible_batters || cachedRankings.top_10_batters || []),
        ...(cachedRankings.eligible_bowlers || cachedRankings.top_10_bowlers || []),
      ];
      for (const p of allList) {
        map.set(String(p.player_id), p);
      }
    }
    return map;
  });

  const [allDirectory, setAllDirectory] = useState<PlayerDirectoryItem[]>(() => cachedDir || []);
  const [dnaData, setDnaData] = useState<any | null>(() => cachedDna || null);
  const [loading, setLoading] = useState(() => !cachedRankings);

  // Search picker state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlotForReplace, setActiveSlotForReplace] = useState<number | null>(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [searchRoleFilter, setSearchRoleFilter] = useState<'all' | 'batter' | 'bowler'>('all');
  const [showMathExplanation, setShowMathExplanation] = useState(false);

  // Raw selected IDs from URL query (no hardcoded defaults)
  const rawIds = useMemo(() => {
    return (searchParams.get('ids') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [searchParams]);

  useEffect(() => {
    async function loadCompareData() {
      try {
        const [rData, pDir, dData] = await Promise.all([
          dataLoader.getRankings(),
          dataLoader.getPlayersIndex(),
          dataLoader.getDnaData(),
        ]);

        const rMap = new Map<string, RankedPlayer>();
        const allList = [
          ...(rData.eligible_batters || rData.top_10_batters || []),
          ...(rData.eligible_bowlers || rData.top_10_bowlers || []),
        ];
        for (const p of allList) {
          rMap.set(String(p.player_id), p);
        }

        setRankedPlayers(rMap);
        setAllDirectory(pDir || []);
        setDnaData(dData);

        canonicalRegistry.initialize(
          pDir || [],
          rData.eligible_batters || rData.top_10_batters || [],
          rData.eligible_bowlers || rData.top_10_bowlers || []
        );
      } catch (err) {
        console.error('Failed to load compare data', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompareData();
  }, []);

  // Update URL query parameters
  const updateSelectedIds = (ids: string[]) => {
    const next = new URLSearchParams(searchParams);
    if (ids.length === 0) {
      next.delete('ids');
    } else {
      next.set('ids', ids.join(','));
    }
    setSearchParams(next, { replace: true });
  };

  // Remove player at specific index or by ID
  const removePlayer = (idToRemove: string) => {
    const nextIds = rawIds.filter((id) => id !== idToRemove);
    updateSelectedIds(nextIds);
    setIsAddingOpen(false);
    setActiveSlotForReplace(null);
  };

  // Add player to next available slot
  const addPlayer = (idToAdd: string) => {
    const strId = String(idToAdd);
    if (rawIds.includes(strId)) return;

    if (activeSlotForReplace !== null && activeSlotForReplace < rawIds.length) {
      const nextIds = [...rawIds];
      nextIds[activeSlotForReplace] = strId;
      updateSelectedIds(nextIds);
    } else {
      if (rawIds.length >= 3) return;
      updateSelectedIds([...rawIds, strId]);
    }

    setIsAddingOpen(false);
    setActiveSlotForReplace(null);
    setSearchQuery('');
  };

  // Compute effective selected player objects
  const selectedPlayers: RankedPlayer[] = useMemo(() => {
    return rawIds
      .slice(0, 3)
      .map((id) => rankedPlayers.get(id))
      .filter((p): p is RankedPlayer => !!p);
  }, [rawIds, rankedPlayers]);

  // Discipline compatibility check
  const roles = new Set(selectedPlayers.map((p) => p.role));
  const hasRoleMismatch = roles.size > 1;

  const p1 = selectedPlayers[0];
  const p2 = selectedPlayers[1];
  const p3 = selectedPlayers[2];

  // Comparison metrics for delta bar (comparing player 1 and player 2)
  const deltaMetrics = useMemo(() => {
    if (!p1 || !p2) return [];

    const safeRating1 = p1.rating || 0;
    const safeRating2 = p2.rating || 1;
    const safePV1 = p1.pressure_value || 0;
    const safePV2 = p2.pressure_value || 0.01;
    const safeCD1 = p1.CD || 0;
    const safeCD2 = p2.CD || 0.01;
    const safePC1 = p1.PC || 0;
    const safePC2 = p2.PC || 1;

    return [
      {
        name: 'Bayesian Rating',
        deltaPct: parseFloat((((safeRating1 - safeRating2) / safeRating2) * 100).toFixed(1)),
        val1: safeRating1.toFixed(2),
        val2: safeRating2.toFixed(2),
      },
      {
        name: 'Pressure Value (PV)',
        deltaPct: parseFloat((((safePV1 - safePV2) / Math.max(0.01, Math.abs(safePV2))) * 100).toFixed(1)),
        val1: formatPerHundred(safePV1 * 100),
        val2: formatPerHundred(safePV2 * 100),
      },
      {
        name: 'Clutch Delta (CD)',
        deltaPct: parseFloat((((safeCD1 - safeCD2) / Math.max(0.01, Math.abs(safeCD2))) * 100).toFixed(1)),
        val1: formatPerHundred(safeCD1 * 100),
        val2: formatPerHundred(safeCD2 * 100),
      },
      {
        name: 'Consistency (PC)',
        deltaPct: parseFloat((((safePC1 - safePC2) / safePC2) * 100).toFixed(1)),
        val1: formatPercent(safePC1),
        val2: formatPercent(safePC2),
      },
    ];
  }, [p1, p2]);

  // Extract authentic DNA percentiles from dna.json
  const radarAxes = useMemo(() => {
    if (!p1) return [];
    if (p1.role === 'batter') {
      return [
        { name: 'Chase Leverage', max: 100 },
        { name: 'Death Overs', max: 100 },
        { name: 'Post Collapse', max: 100 },
        { name: 'Acceleration', max: 100 },
        { name: 'Wicket Preserv.', max: 100 },
        { name: 'Consistency', max: 100 },
      ];
    } else {
      return [
        { name: 'Chase Defence', max: 100 },
        { name: 'Death Overs', max: 100 },
        { name: 'Post-Wkt Press', max: 100 },
        { name: 'Run Control', max: 100 },
        { name: 'Wkt Strike Rate', max: 100 },
        { name: 'Consistency', max: 100 },
      ];
    }
  }, [p1]);

  const getDnaValues = (player?: RankedPlayer): number[] => {
    if (!player || !dnaData?.players?.[String(player.player_id)]?.axes) {
      return [50, 50, 50, 50, 50, 50];
    }
    const axesObj = dnaData.players[String(player.player_id)].axes;
    const keys = player.role === 'batter'
      ? ['chase', 'death', 'post_collapse', 'acceleration', 'wicket_control', 'consistency']
      : ['chase_defence', 'death', 'post_wicket_pressing', 'run_control', 'wicket_taking', 'consistency'];

    return keys.map((k) => {
      const ax = axesObj[k];
      if (ax && typeof ax.percentile === 'number' && !isNaN(ax.percentile)) {
        return Math.min(100, Math.max(0, Math.round(ax.percentile)));
      }
      return 50;
    });
  };

  const p1Dna = getDnaValues(p1);
  const p2Dna = getDnaValues(p2);
  const p3Dna = p3 ? getDnaValues(p3) : undefined;

  // Head-to-Head Dynamic Conclusion Generator
  const headToHeadConclusion = useMemo(() => {
    if (!p1 || !p2) return 'Select at least two players to generate an evidence-backed head-to-head comparison.';
    if (hasRoleMismatch) {
      return `${p1.player_name} (${p1.role}) and ${p2.player_name} (${p2.role}) operate in different tactical disciplines. Direct cross-discipline comparison is restricted to standardized Bayesian ratings and sample exposure.`;
    }

    const ratingLeader = (p1.rating || 0) >= (p2.rating || 0) ? p1 : p2;
    const pvLeader = (p1.pressure_value || 0) >= (p2.pressure_value || 0) ? p1 : p2;
    const cdLeader = (p1.CD || 0) >= (p2.CD || 0) ? p1 : p2;
    const pcLeader = (p1.PC || 0) >= (p2.PC || 0) ? p1 : p2;

    if (pvLeader === cdLeader && cdLeader === pcLeader) {
      return `${ratingLeader.player_name} universally outperforms in high-pressure states, exhibiting superior run generation (+${Math.abs(((p1.pressure_value || 0) - (p2.pressure_value || 0)) * 100).toFixed(1)} PV/100b), higher clutch elevation (+${Math.abs(((p1.CD || 0) - (p2.CD || 0)) * 100).toFixed(1)} CD/100b), and greater consistency (${formatPercent(ratingLeader.PC || 0)}).`;
    }

    return `Comparative analysis reveals contrasting situational profiles: ${pvLeader.player_name} leads overall run value under pressure (${formatPerHundred((pvLeader.pressure_value || 0) * 100)} /100b), while ${cdLeader.player_name} exhibits greater clutch elevation over baseline (+${formatPerHundred((cdLeader.CD || 0) * 100)} /100b). Consistency favors ${pcLeader.player_name} (${formatPercent(pcLeader.PC || 0)}).`;
  }, [p1, p2, hasRoleMismatch]);

  // Filtered player search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return Array.from(rankedPlayers.values())
      .filter((p) => {
        // Role filter
        if (searchRoleFilter !== 'all' && p.role !== searchRoleFilter) return false;
        // Don't show already selected players (unless replacing)
        if (activeSlotForReplace === null && rawIds.includes(String(p.player_id))) return false;
        if (activeSlotForReplace !== null && rawIds[activeSlotForReplace] === String(p.player_id)) return false;

        if (!q) return true;

        const nameMatch = p.player_name.toLowerCase().includes(q);
        const idMatch = String(p.player_id).includes(q);
        const franchise = getPlayerFranchise(p.player_id);
        const franchiseMatch = franchise
          ? franchise.short.toLowerCase().includes(q) || franchise.name.toLowerCase().includes(q)
          : false;

        return nameMatch || idMatch || franchiseMatch;
      })
      .slice(0, 10);
  }, [rankedPlayers, searchQuery, searchRoleFilter, rawIds, activeSlotForReplace]);

  if (loading && rankedPlayers.size === 0) {
    return (
      <div className="py-24 text-center text-slate-400 font-sans">
        <GitCompare className="w-8 h-8 text-[#E6007E] animate-pulse mx-auto mb-2" />
        <span className="text-xs font-semibold">Loading Bayesian comparison models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150 font-sans">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#14213D] tracking-tight flex items-center gap-2 font-sans">
            <GitCompare className="w-6 h-6 text-[#E6007E]" />
            <span>Player Comparison Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Side-by-side analytical benchmarking across certified Bayesian parameters, situational DNA, and clutch elevation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedPlayers.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateSelectedIds([])}
              className="text-xs text-slate-600 hover:text-rose-600"
            >
              Clear Comparison
            </Button>
          )}

          {selectedPlayers.length < 3 && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setActiveSlotForReplace(null);
                setIsAddingOpen(true);
              }}
              icon={<Plus className="w-4 h-4 text-white" />}
              className="bg-[#14213D] hover:bg-slate-800 text-white font-bold"
            >
              Add Player ({selectedPlayers.length}/3)
            </Button>
          )}
        </div>
      </div>

      {/* 2. Searchable Player Picker Modal / Dropdown */}
      {isAddingOpen && (
        <Card className="p-4 border-[#E6007E]/40 bg-pink-subtle/10 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#E6007E]" />
              <span className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
                {activeSlotForReplace !== null
                  ? `Replace Player ${activeSlotForReplace + 1}`
                  : `Add Player to Comparison (${selectedPlayers.length + 1} of 3)`}
              </span>
            </div>
            <button
              onClick={() => {
                setIsAddingOpen(false);
                setActiveSlotForReplace(null);
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Inputs & Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by player name, canonical ID (e.g. 6931, 360), or franchise..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setSearchRoleFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  searchRoleFilter === 'all'
                    ? 'bg-[#14213D] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Roles
              </button>
              <button
                type="button"
                onClick={() => setSearchRoleFilter('batter')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  searchRoleFilter === 'batter'
                    ? 'bg-[#E6007E] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Batters
              </button>
              <button
                type="button"
                onClick={() => setSearchRoleFilter('bowler')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  searchRoleFilter === 'bowler'
                    ? 'bg-[#C6A15B] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Bowlers
              </button>
            </div>
          </div>

          {/* Search Results List */}
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-2xs">
            {searchResults.length > 0 ? (
              searchResults.map((p) => {
                const franchise = getPlayerFranchise(p.player_id);
                const country = getPlayerNationality(p.player_id);
                const flagSrc = getCountryFlag(country);

                return (
                  <button
                    key={p.player_id}
                    onClick={() => addPlayer(String(p.player_id))}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-medium transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlayerAvatar playerId={p.player_id} playerName={p.player_name} size="xs" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-[#E6007E] transition-colors truncate">
                            {p.player_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">#{p.player_id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">
                            #{p.rank} {p.role === 'batter' ? 'BAT' : 'BOWL'}
                          </span>
                          <span>•</span>
                          {flagSrc && (
                            <img src={flagSrc} alt={country} className="w-3.5 h-2.5 object-cover rounded-2xs inline-block" />
                          )}
                          <span>{country}</span>
                          {franchise && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-[#14213D]">{franchise.short}</span>
                              {franchise.note && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                  {franchise.note}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Rating</div>
                      <span className="font-black text-[#E6007E] text-xs tabular-nums">
                        {p.rating.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching eligible players found. Try a different name, role, or ID.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 3. Role Mismatch Warning Banner */}
      {hasRoleMismatch && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Role Disparity Notice:</strong> You are benchmarking a Batter against a Bowler. While standardized Bayesian ratings (0–100) and sample exposures are universally comparable, directional performance metrics (Strike Rate vs Economy Rate, PV Batting vs PV Bowling) operate on inverse scales.
          </div>
        </div>
      )}

      {/* 4. Interactive 3-Slot Player Comparison Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[0, 1, 2].map((slotIdx) => {
          const player = selectedPlayers[slotIdx];
          const accentColor =
            slotIdx === 0 ? 'border-slate-800' : slotIdx === 1 ? 'border-[#E6007E]' : 'border-[#C6A15B]';

          if (player) {
            const country = getPlayerNationality(player.player_id);
            const flagSrc = getCountryFlag(country);
            const franchise = getPlayerFranchise(player.player_id);

            return (
              <Card key={player.player_id} className={`p-4 border-2 ${accentColor} relative shadow-2xs flex flex-col justify-between`}>
                {/* Remove button */}
                <button
                  onClick={() => removePlayer(String(player.player_id))}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Remove player"
                  aria-label={`Remove ${player.player_name}`}
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <PlayerAvatar
                      playerId={player.player_id}
                      playerName={player.player_name}
                      size="md"
                    />
                    <div className="min-w-0 pr-6">
                      <Link
                        to={`/player/${player.player_id}`}
                        className="font-bold text-sm text-[#14213D] truncate block hover:text-[#E6007E] transition-colors"
                      >
                        {player.player_name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="tabular-nums font-mono text-[10px]">#{player.player_id}</span>
                        <span>•</span>
                        <span className="font-semibold">Rank #{player.rank} {player.role === 'batter' ? 'BAT' : 'BOWL'}</span>
                        {flagSrc && (
                          <img src={flagSrc} alt={country} title={country} className="w-3.5 h-2.5 object-cover rounded-2xs inline-block" />
                        )}
                        {franchise && (
                          <div className="flex items-center gap-1 font-bold text-slate-700">
                            {franchise.logo && (
                              <img src={franchise.logo} alt={franchise.short} className="w-3.5 h-3.5 object-contain" />
                            )}
                            <span>{franchise.short}</span>
                            {franchise.note && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                {franchise.note}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-2.5 border-t border-slate-100 font-sans">
                    <RatingDisplay value={player.rating} size="sm" />
                    <TierBadge tier={player.tier} size="sm" />
                  </div>
                </div>

                {/* Replace button control */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Slot {slotIdx + 1}</span>
                  <button
                    onClick={() => {
                      setActiveSlotForReplace(slotIdx);
                      setIsAddingOpen(true);
                    }}
                    className="text-[11px] font-bold text-[#E6007E] hover:text-[#D8005A] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                </div>
              </Card>
            );
          }

          // Empty slot placeholder
          return (
            <div
              key={`empty-slot-${slotIdx}`}
              onClick={() => {
                setActiveSlotForReplace(slotIdx);
                setIsAddingOpen(true);
              }}
              className="border-2 border-dashed border-slate-200 hover:border-[#E6007E]/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-pink-subtle/10 transition-all min-h-[160px] group"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-[#E6007E]/40 flex items-center justify-center text-slate-400 group-hover:text-[#E6007E] mb-2 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#14213D]">
                {slotIdx === 0
                  ? 'Select Player 1'
                  : slotIdx === 1
                  ? 'Select Player 2'
                  : 'Add 3rd Player (Optional)'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Click to search canonical registry</span>
            </div>
          );
        })}
      </div>

      {/* 5. Empty State Prompt with 1-Click Popular Benchmarks when fewer than 2 players selected */}
      {selectedPlayers.length === 0 && (
        <Card className="p-8 text-center space-y-4 border-slate-200">
          <div className="w-12 h-12 rounded-full bg-[#14213D]/5 flex items-center justify-center mx-auto text-[#14213D]">
            <GitCompare className="w-6 h-6 text-[#E6007E]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14213D]">Select Players to Begin Comparison</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Search and add any eligible batter or bowler from the certified 306-player registry, or load one of the quick benchmark presets below.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Certified Benchmarks
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedIds(['6931', '4260'])}
                className="text-xs font-semibold"
              >
                Pathum Nissanka vs Heinrich Klaasen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedIds(['8661', '830'])}
                className="text-xs font-semibold"
              >
                Matheesha Pathirana vs Josh Hazlewood
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedIds(['1318', '2756'])}
                className="text-xs font-semibold"
              >
                Andre Russell vs Shashank Singh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedIds(['360', '1758'])}
                className="text-xs font-semibold"
              >
                Bhuvneshwar Kumar vs Pat Cummins
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateSelectedIds(['781', '2876'])}
                className="text-xs font-semibold"
              >
                Sunil Narine vs Axar Patel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Single-Player Guidance Banner */}
      {selectedPlayers.length === 1 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#E6007E] shrink-0" />
            <span>
              <strong>{selectedPlayers[0].player_name}</strong> selected. Select a second player above to generate head-to-head delta comparisons, relative advantage bars, and Bayesian benchmark matrices.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveSlotForReplace(1);
              setIsAddingOpen(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add 2nd Player
          </Button>
        </div>
      )}

      {/* 7. Direct Head-to-Head Analytical Summary */}
      {selectedPlayers.length >= 2 && p1 && p2 && (
        <Card className="p-4 border-slate-200 bg-slate-50/50 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
              Direct Head-to-Head Evaluation
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Certified Analytical Verdict</span>
          </div>

          {/* Dynamic Evidence-Backed Narrative */}
          <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
            {headToHeadConclusion}
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Rating Leader</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {(p1.rating || 0) >= (p2.rating || 0) ? p1.player_name : p2.player_name}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                +{Math.abs((p1.rating || 0) - (p2.rating || 0)).toFixed(2)} pts
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Run Value (PV)</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {(p1.pressure_value || 0) >= (p2.pressure_value || 0) ? p1.player_name : p2.player_name}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                +{Math.abs(((p1.pressure_value || 0) - (p2.pressure_value || 0)) * 100).toFixed(1)} /100b
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Clutch Elevation</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {(p1.CD || 0) >= (p2.CD || 0) ? p1.player_name : p2.player_name}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                +{Math.abs(((p1.CD || 0) - (p2.CD || 0)) * 100).toFixed(1)} /100b
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Consistency Hit Rate</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {(p1.PC || 0) >= (p2.PC || 0) ? p1.player_name : p2.player_name}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums">
                +{Math.abs(((p1.PC || 0) - (p2.PC || 0)) * 100).toFixed(1)}% hit rate
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 8. Visual Analytics Row: Dual/Triple Radar + Diverging Bar */}
      {selectedPlayers.length >= 2 && p1 && p2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartWrapper
            title="Overlaid Pressure DNA Radar"
            subtitle="6-axis skill percentiles under high-leverage match conditions."
            sourceKey="COMPARE-RADAR"
            provenance="Model estimate"
            height={340}
          >
            <DualRadarChart
              axes={radarAxes}
              player1Name={p1.player_name}
              player1Values={p1Dna}
              player2Name={p2.player_name}
              player2Values={p2Dna}
              player3Name={p3?.player_name}
              player3Values={p3Dna}
              height={340}
            />
          </ChartWrapper>

          <ChartWrapper
            title={`Relative Advantage: ${p1.player_name} vs ${p2.player_name}`}
            subtitle="Percentage margin across primary statistical components."
            sourceKey="DELTA-METRICS"
            provenance="Calculated"
            height={340}
          >
            <MetricDeltaChart
              metrics={deltaMetrics}
              player1Name={p1.player_name}
              player2Name={p2.player_name}
              height={320}
            />
          </ChartWrapper>
        </div>
      )}

      {/* 9. Detailed Side-by-Side Metric Benchmark Table */}
      {selectedPlayers.length >= 2 && p1 && p2 && (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-2xs">
          <div className="px-4 py-3 bg-[#14213D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Direct Metric Benchmark</span>
            <span className="text-[10px] text-slate-300 font-normal">All figures rendered in SF Pro tabular numerals</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                {/* Posterior Rating */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-bold text-slate-800 w-1/4">
                    <Tooltip content="Regularized Bayesian rating on a standardized 0–100 scale. Combines PV, CD, and PC.">
                      <span className="cursor-help border-b border-dotted border-slate-400">Bayesian Rating</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 font-black text-sm text-[#14213D] tabular-nums">
                      {(p.rating || 0).toFixed(2)}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs font-semibold text-slate-600 tabular-nums">
                    Leader: <strong className="text-slate-900">{(p1.rating || 0) >= (p2.rating || 0) ? p1.player_name : p2.player_name}</strong> (+{Math.abs((p1.rating || 0) - (p2.rating || 0)).toFixed(2)})
                  </td>
                </tr>

                {/* 90% Credible Interval */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-600">
                    <Tooltip content="Posterior 90% credible interval [R_low, R_high] derived from MCMC sampling.">
                      <span className="cursor-help border-b border-dotted border-slate-400">90% Credible Interval</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 text-slate-700 tabular-nums">
                      [{p.rating_ci90?.[0]?.toFixed(1) || '—'}, {p.rating_ci90?.[1]?.toFixed(1) || '—'}]
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs text-slate-500">
                    Confidence interval overlap: {Math.max(0, Math.min(p1.rating_ci90?.[1] || 100, p2.rating_ci90?.[1] || 100) - Math.max(p1.rating_ci90?.[0] || 0, p2.rating_ci90?.[0] || 0)).toFixed(1)} pts
                  </td>
                </tr>

                {/* Pressure Value (PV) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-600">
                    <Tooltip content="Pressure Value (PV): Runs generated above expectation per 100 pressure deliveries.">
                      <span className="cursor-help border-b border-dotted border-slate-400">Pressure Value (PV)</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 text-slate-800 font-semibold tabular-nums">
                      {formatPerHundred((p.pressure_value || 0) * 100)} /100b
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs font-semibold text-slate-600 tabular-nums">
                    Leader: <strong className="text-slate-900">{(p1.pressure_value || 0) >= (p2.pressure_value || 0) ? p1.player_name : p2.player_name}</strong> (+{Math.abs(((p1.pressure_value || 0) - (p2.pressure_value || 0)) * 100).toFixed(1)} /100b)
                  </td>
                </tr>

                {/* Clutch Delta (CD) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-600">
                    <Tooltip content="Clutch Delta (CD): Net elevation in high-pressure over normal-phase output.">
                      <span className="cursor-help border-b border-dotted border-slate-400">Clutch Delta (CD)</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 text-slate-800 font-semibold tabular-nums">
                      {formatPerHundred((p.CD || 0) * 100)} /100b
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs font-semibold text-slate-600 tabular-nums">
                    Leader: <strong className="text-slate-900">{(p1.CD || 0) >= (p2.CD || 0) ? p1.player_name : p2.player_name}</strong> (+{Math.abs(((p1.CD || 0) - (p2.CD || 0)) * 100).toFixed(1)} /100b)
                  </td>
                </tr>

                {/* Pressure Consistency (PC) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-600">
                    <Tooltip content="Percentage of qualifying matches where the player generated positive game value under pressure.">
                      <span className="cursor-help border-b border-dotted border-slate-400">Consistency (PC)</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 text-slate-800 font-semibold tabular-nums">
                      {formatPercent(p.PC || 0)}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs font-semibold text-slate-600 tabular-nums">
                    Leader: <strong className="text-slate-900">{(p1.PC || 0) >= (p2.PC || 0) ? p1.player_name : p2.player_name}</strong> (+{Math.abs(((p1.PC || 0) - (p2.PC || 0)) * 100).toFixed(1)}%)
                  </td>
                </tr>

                {/* Information Exposure */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-600">
                    <Tooltip content="High-pressure deliveries faced or bowled (n) and effective sample size (n_eff).">
                      <span className="cursor-help border-b border-dotted border-slate-400">Sample Exposure</span>
                    </Tooltip>
                  </td>
                  {selectedPlayers.map((p) => (
                    <td key={p.player_id} className="py-2.5 px-4 text-slate-700 tabular-nums">
                      {p.n_pressure_deliveries || 0} balls ({p.neff_pressure?.toFixed(1) || '—'} neff)
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-xs text-slate-500 tabular-nums">
                    Sample margin: {Math.abs((p1.n_pressure_deliveries || 0) - (p2.n_pressure_deliveries || 0))} balls
                  </td>
                </tr>

                {/* Role Specific: Batting SR / Bowling Economy */}
                {!hasRoleMismatch && p1.descriptive_stats && p2.descriptive_stats && (
                  <tr className="hover:bg-slate-50/60 bg-slate-50/30">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {p1.role === 'batter' ? 'Pressure Strike Rate' : 'Pressure Economy'}
                    </td>
                    {selectedPlayers.map((p) => (
                      <td key={p.player_id} className="py-2.5 px-4 font-bold text-slate-900 tabular-nums">
                        {p.role === 'batter'
                          ? `${p.descriptive_stats?.pressure_sr?.toFixed(1) || '—'} sr`
                          : `${p.descriptive_stats?.pressure_economy?.toFixed(2) || '—'} rpo`}
                      </td>
                    ))}
                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-600 tabular-nums">
                      {p1.role === 'batter' ? (
                        <span>
                          Leader: <strong>{(p1.descriptive_stats.pressure_sr || 0) >= (p2.descriptive_stats.pressure_sr || 0) ? p1.player_name : p2.player_name}</strong> (+{Math.abs((p1.descriptive_stats.pressure_sr || 0) - (p2.descriptive_stats.pressure_sr || 0)).toFixed(1)})
                        </span>
                      ) : (
                        <span>
                          Leader (Lower): <strong>{(p1.descriptive_stats.pressure_economy || 99) <= (p2.descriptive_stats.pressure_economy || 99) ? p1.player_name : p2.player_name}</strong> ({Math.abs((p1.descriptive_stats.pressure_economy || 0) - (p2.descriptive_stats.pressure_economy || 0)).toFixed(2)} rpo lower)
                        </span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 10. Expandable Mathematical Trace & Provenance */}
      <Card className="p-4 border-slate-200">
        <button
          onClick={() => setShowMathExplanation(!showMathExplanation)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-[#14213D]"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#E6007E]" />
            <span>Mathematical Trace & Bayesian Benchmark Provenance</span>
          </span>
          {showMathExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMathExplanation && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2.5 leading-relaxed font-sans">
            <p>
              <strong>Empirical Bayes Regularization:</strong> Raw observed metrics (PV, CD) are shrunk toward cohort priors using shrinkage factor{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">B_i = τ² / (τ² + σ_i²)</code>, where{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">σ_i² = 1 / N_eff</code>. This prevents small-sample inflation and ensures parity across all comparison sets.
            </p>
            <p>
              <strong>Standardization & Composite Z-Score:</strong> Shrunk metrics are normalized to standard normal distributions (mean 0, variance 1) and linearly combined according to audited weights:
              <br />
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">Composite = 0.50·Z_PV + 0.30·Z_CD + 0.20·Z_PC</code> (Batters)
              <br />
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">Composite = 0.50·Z_PV + 0.30·Z_CD* + 0.20·Z_PC</code> (Bowlers with orthogonalized Clutch Delta)
            </p>
            <p className="text-[11px] text-slate-400">
              Data source: Phase 04 Empirical Bayes regularized posterior distributions. Full precision rankings frozen under SHA-256 ledger integrity.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};