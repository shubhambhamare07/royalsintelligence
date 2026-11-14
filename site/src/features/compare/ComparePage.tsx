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
  ExternalLink,
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
  const [rankedPlayers, setRankedPlayers] = useState<Map<string, RankedPlayer>>(new Map());
  const [allDirectory, setAllDirectory] = useState<PlayerDirectoryItem[]>([]);
  const [dnaData, setDnaData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Search picker state
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMathExplanation, setShowMathExplanation] = useState(false);

  // Raw selected IDs from URL query
  const rawIds = (searchParams.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

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

  // Compute effective selected player objects
  const effectivePlayerIds = useMemo(() => {
    // If no IDs provided, default to Pathum Nissanka (#6931) and Heinrich Klaasen (#4260)
    if (rawIds.length === 0) {
      return ['6931', '4260'];
    }

    // If only 1 ID is provided (e.g. from clicking "Compare" on a player profile),
    // automatically pair them with an appropriate rival of the same role
    if (rawIds.length === 1 && rankedPlayers.size > 0) {
      const p1Id = rawIds[0];
      const p1 = rankedPlayers.get(p1Id);
      if (p1) {
        let rivalId: string;
        if (p1.role === 'batter') {
          rivalId = p1Id === '6931' ? '4260' : '6931';
        } else {
          rivalId = p1Id === '8661' ? '4219' : '8661';
        }
        return [p1Id, rivalId];
      }
    }

    return rawIds.slice(0, 3);
  }, [rawIds, rankedPlayers]);

  const updateSelectedIds = (ids: string[]) => {
    const next = new URLSearchParams(searchParams);
    if (ids.length === 0) {
      next.delete('ids');
    } else {
      next.set('ids', ids.join(','));
    }
    setSearchParams(next);
  };

  const removePlayer = (idToRemove: string) => {
    updateSelectedIds(effectivePlayerIds.filter((id) => id !== idToRemove));
  };

  const addPlayer = (idToAdd: string) => {
    if (effectivePlayerIds.length >= 3 || effectivePlayerIds.includes(idToAdd)) return;
    updateSelectedIds([...effectivePlayerIds, idToAdd]);
    setIsAdding(false);
    setSearchQuery('');
  };

  const selectedPlayers: RankedPlayer[] = useMemo(() => {
    return effectivePlayerIds
      .map((id) => rankedPlayers.get(id))
      .filter((p): p is RankedPlayer => !!p);
  }, [effectivePlayerIds, rankedPlayers]);

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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-sans">
        <GitCompare className="w-8 h-8 text-[#E6007E] animate-pulse mx-auto mb-2" />
        <span className="text-xs font-semibold">Loading Bayesian comparison models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#14213D] tracking-tight flex items-center gap-2 font-sans">
            <GitCompare className="w-6 h-6 text-[#E6007E]" />
            <span>Player Comparison Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Side-by-side analytical benchmarking across certified Bayesian parameters and situational DNA.
          </p>
        </div>

        {selectedPlayers.length < 3 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(!isAdding)}
            icon={<Plus className="w-4 h-4 text-[#E6007E]" />}
          >
            Add Player (Up to 3)
          </Button>
        )}
      </div>

      {/* 2. Role Mismatch Warning Banner */}
      {hasRoleMismatch && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Role Disparity Notice:</strong> You are benchmarking a Batter against a Bowler. While standardized Bayesian ratings (0–100) and sample exposures are universally comparable, directional performance metrics (Strike Rate vs Economy Rate, PV Batting vs PV Bowling) operate on inverse scales.
          </div>
        </div>
      )}

      {/* 3. Searchable Player Selector Modal / Card */}
      {isAdding && (
        <Card className="p-3.5 border-[#E6007E]/40 bg-pink-subtle/20 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
              Add Player to Comparison
            </span>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type player name, canonical ID, or franchise..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-[#14213D] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
          />

          {searchQuery && (
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-2xs">
              {Array.from(rankedPlayers.values())
                .filter(
                  (p) =>
                    (p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      String(p.player_id).includes(searchQuery)) &&
                    !effectivePlayerIds.includes(String(p.player_id))
                )
                .slice(0, 6)
                .map((p) => {
                  const franchise = getPlayerFranchise(p.player_id);

                  return (
                    <button
                      key={p.player_id}
                      onClick={() => addPlayer(String(p.player_id))}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <PlayerAvatar playerId={p.player_id} playerName={p.player_name} size="xs" />
                        <span className="font-bold text-slate-900">{p.player_name}</span>
                        <span className="text-slate-400 font-normal">
                          (#{p.rank} {p.role === 'batter' ? 'BAT' : 'BOWL'})
                        </span>
                        {franchise && <span className="font-semibold text-slate-500 text-[10px]">{franchise.short}</span>}
                      </div>
                      <span className="font-bold text-[#E6007E] tabular-nums">
                        {p.rating.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {/* 4. Selected Players Identity Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {selectedPlayers.map((player, idx) => {
          const accentColor =
            idx === 0 ? 'border-slate-800' : idx === 1 ? 'border-[#E6007E]' : 'border-[#C6A15B]';
          const country = getPlayerNationality(player.player_id);
          const flagSrc = getCountryFlag(country);
          const franchise = getPlayerFranchise(player.player_id);

          return (
            <Card key={player.player_id} className={`p-4 border-2 ${accentColor} relative shadow-2xs`}>
              {selectedPlayers.length > 1 && (
                <button
                  onClick={() => removePlayer(String(player.player_id))}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Remove player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

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
                    <span className="tabular-nums">#{player.player_id}</span>
                    <span>•</span>
                    <span className="font-semibold">Rank #{player.rank} {player.role === 'batter' ? 'BAT' : 'BOWL'}</span>
                    {flagSrc && (
                      <img src={flagSrc} alt={country} className="w-3.5 h-2.5 object-cover rounded-2xs inline-block" />
                    )}
                    {franchise && <span className="font-bold text-slate-700">{franchise.short}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2.5 border-t border-slate-100 font-sans">
                <RatingDisplay value={player.rating} size="sm" />
                <TierBadge tier={player.tier} size="sm" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 5. Direct Head-to-Head Analytical Summary */}
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

      {/* 6. Visual Analytics Row: Dual Radar + Diverging Bar */}
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

      {/* 7. Detailed Side-by-Side Metric Benchmark Table */}
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

      {/* 8. Expandable Mathematical Trace & Provenance */}
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
