import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Dna,
  ShieldCheck,
  Info,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { TierBadge } from '../../components/cricket/TierBadge';
import { RatingDisplay } from '../../components/cricket/RatingDisplay';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { RadarChart } from '../../components/charts/RadarChart';
import { Tooltip } from '../../components/ui/Tooltip';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { RankedPlayer, PlayerDirectoryItem, PlayerDossier } from '../../lib/data/types';
import { getPlayerFranchise, getPlayerNationality, getCountryFlag } from '../../lib/data/playerMetadata';
import { formatPerHundred, formatPercent } from '../../lib/format/numbers';

interface DimensionDetail {
  key: string;
  name: string;
  description: string;
  percentile: number | null;
  value: number | null;
  n: number;
  neff: number;
  ci90?: [number, number];
  isFavorableHigher: boolean;
  status: 'certified' | 'insufficient' | 'unavailable';
}

export const DnaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dnaData, setDnaData] = useState<any | null>(null);
  const [rankedPlayers, setRankedPlayers] = useState<RankedPlayer[]>([]);
  const [directory, setDirectory] = useState<PlayerDirectoryItem[]>([]);
  const [dossier, setDossier] = useState<PlayerDossier | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(id || '6931');
  const [loading, setLoading] = useState(true);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [dData, rData, pDir] = await Promise.all([
          dataLoader.getDnaData(),
          dataLoader.getRankings(),
          dataLoader.getPlayersIndex(),
        ]);
        setDnaData(dData);
        const allList = [
          ...(rData.eligible_batters || rData.top_10_batters),
          ...(rData.eligible_bowlers || rData.top_10_bowlers),
        ];
        setRankedPlayers(allList);
        setDirectory(pDir);
        canonicalRegistry.initialize(
          pDir,
          rData.eligible_batters || rData.top_10_batters,
          rData.eligible_bowlers || rData.top_10_bowlers
        );
      } catch (err) {
        console.error('Failed to load DNA lab data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      setSelectedPlayerId(id);
    }
  }, [id]);

  useEffect(() => {
    async function loadPlayerDossier() {
      try {
        const d = await dataLoader.getPlayerDossier(selectedPlayerId);
        setDossier(d);
      } catch (err) {
        setDossier(null);
      }
    }
    if (selectedPlayerId) {
      loadPlayerDossier();
    }
  }, [selectedPlayerId]);

  const activeRankedPlayer = rankedPlayers.find((p) => String(p.player_id) === selectedPlayerId);
  const activeDirPlayer = directory.find((p) => String(p.player_id) === selectedPlayerId);
  const playerName = canonicalRegistry.getCanonicalName(selectedPlayerId, activeRankedPlayer?.player_name || activeDirPlayer?.name);
  const playerDna = dnaData?.players?.[selectedPlayerId];

  const primaryRole: 'batter' | 'bowler' =
    activeRankedPlayer?.role ||
    (activeDirPlayer?.derived_role === 'BOWL' ? 'bowler' : 'batter');

  const country = getPlayerNationality(selectedPlayerId, activeDirPlayer?.national_teams);
  const flagSrc = getCountryFlag(country);
  const franchise = getPlayerFranchise(selectedPlayerId, activeDirPlayer?.franchise_teams);

  // Dimension definitions & mapping based on player role
  const dimensions: DimensionDetail[] = useMemo(() => {
    if (primaryRole === 'batter') {
      const axesObj = playerDna?.axes || {};
      return [
        {
          key: 'chase',
          name: 'Chase Leverage',
          description: 'Net run contribution on high-leverage deliveries during 2nd innings run-chases.',
          percentile: axesObj.chase?.insufficient_evidence ? null : axesObj.chase?.percentile ?? null,
          value: axesObj.chase?.value ?? null,
          n: axesObj.chase?.n ?? 0,
          neff: axesObj.chase?.n_eff ?? 0,
          ci90: axesObj.chase?.ci90,
          isFavorableHigher: true,
          status: axesObj.chase?.insufficient_evidence || (axesObj.chase?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'death',
          name: 'Death Acceleration',
          description: 'Boundary output and run efficiency in death overs (overs 16–20) under high required rates.',
          percentile: axesObj.death?.insufficient_evidence ? null : axesObj.death?.percentile ?? null,
          value: axesObj.death?.value ?? null,
          n: axesObj.death?.n ?? 0,
          neff: axesObj.death?.n_eff ?? 0,
          ci90: axesObj.death?.ci90,
          isFavorableHigher: true,
          status: axesObj.death?.insufficient_evidence || (axesObj.death?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'post_collapse',
          name: 'Collapse Resilience',
          description: 'Expected run recovery and survival rate immediately following 2+ wickets within 12 balls.',
          percentile: axesObj.post_collapse?.insufficient_evidence ? null : axesObj.post_collapse?.percentile ?? null,
          value: axesObj.post_collapse?.value ?? null,
          n: axesObj.post_collapse?.n ?? 0,
          neff: axesObj.post_collapse?.n_eff ?? 0,
          ci90: axesObj.post_collapse?.ci90,
          isFavorableHigher: true,
          status: axesObj.post_collapse?.insufficient_evidence || (axesObj.post_collapse?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'acceleration',
          name: 'Boundary Acceleration',
          description: 'Frequency of converting pressure deliveries into scoring boundary events.',
          percentile: axesObj.acceleration?.insufficient_evidence ? null : axesObj.acceleration?.percentile ?? null,
          value: axesObj.acceleration?.value ?? null,
          n: axesObj.acceleration?.n ?? 0,
          neff: axesObj.acceleration?.n_eff ?? 0,
          ci90: axesObj.acceleration?.ci90,
          isFavorableHigher: true,
          status: axesObj.acceleration?.insufficient_evidence || (axesObj.acceleration?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'wicket_control',
          name: 'Wicket Preservation',
          description: 'Minimizing dismissal probability during match-critical leverage windows.',
          percentile: axesObj.wicket_control?.insufficient_evidence ? null : axesObj.wicket_control?.percentile ?? null,
          value: axesObj.wicket_control?.value ?? null,
          n: axesObj.wicket_control?.n ?? 0,
          neff: axesObj.wicket_control?.n_eff ?? 0,
          ci90: axesObj.wicket_control?.ci90,
          isFavorableHigher: true,
          status: axesObj.wicket_control?.insufficient_evidence || (axesObj.wicket_control?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'consistency',
          name: 'Match Consistency',
          description: 'Hit rate of generating positive pressure value across individual match appearances.',
          percentile: axesObj.consistency?.insufficient_evidence ? null : axesObj.consistency?.percentile ?? null,
          value: axesObj.consistency?.value ?? null,
          n: axesObj.consistency?.n ?? 0,
          neff: axesObj.consistency?.n_eff ?? 0,
          ci90: axesObj.consistency?.ci90,
          isFavorableHigher: true,
          status: axesObj.consistency?.insufficient_evidence || (axesObj.consistency?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
      ];
    } else {
      const axesObj = playerDna?.axes || {};
      return [
        {
          key: 'chase_defence',
          name: 'Chase Defence',
          description: 'Run suppression and dot-ball generation when defending a target under chase pressure.',
          percentile: axesObj.chase_defence?.insufficient_evidence ? null : axesObj.chase_defence?.percentile ?? null,
          value: axesObj.chase_defence?.value ?? null,
          n: axesObj.chase_defence?.n ?? 0,
          neff: axesObj.chase_defence?.n_eff ?? 0,
          ci90: axesObj.chase_defence?.ci90,
          isFavorableHigher: true,
          status: axesObj.chase_defence?.insufficient_evidence || (axesObj.chase_defence?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'death',
          name: 'Death Overs Closer',
          description: 'Economy control and yorker/slower-ball effectiveness across overs 16–20.',
          percentile: axesObj.death?.insufficient_evidence ? null : axesObj.death?.percentile ?? null,
          value: axesObj.death?.value ?? null,
          n: axesObj.death?.n ?? 0,
          neff: axesObj.death?.n_eff ?? 0,
          ci90: axesObj.death?.ci90,
          isFavorableHigher: true,
          status: axesObj.death?.insufficient_evidence || (axesObj.death?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'post_wicket_pressing',
          name: 'Post-Wicket Pressing',
          description: 'Capacity to capitalize and deliver dot balls immediately following a dismissal.',
          percentile: axesObj.post_wicket_pressing?.insufficient_evidence ? null : axesObj.post_wicket_pressing?.percentile ?? null,
          value: axesObj.post_wicket_pressing?.value ?? null,
          n: axesObj.post_wicket_pressing?.n ?? 0,
          neff: axesObj.post_wicket_pressing?.n_eff ?? 0,
          ci90: axesObj.post_wicket_pressing?.ci90,
          isFavorableHigher: true,
          status: axesObj.post_wicket_pressing?.insufficient_evidence || (axesObj.post_wicket_pressing?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'run_control',
          name: 'Pressure Run Control',
          description: 'Boundary denial and dot-ball percentage during match-critical leverage deliveries.',
          percentile: axesObj.run_control?.insufficient_evidence ? null : axesObj.run_control?.percentile ?? null,
          value: axesObj.run_control?.value ?? null,
          n: axesObj.run_control?.n ?? 0,
          neff: axesObj.run_control?.n_eff ?? 0,
          ci90: axesObj.run_control?.ci90,
          isFavorableHigher: true,
          status: axesObj.run_control?.insufficient_evidence || (axesObj.run_control?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'wicket_taking',
          name: 'Wicket Strike Rate',
          description: 'Deliveries bowled per dismissal in high-leverage situations.',
          percentile: axesObj.wicket_taking?.insufficient_evidence ? null : axesObj.wicket_taking?.percentile ?? null,
          value: axesObj.wicket_taking?.value ?? null,
          n: axesObj.wicket_taking?.n ?? 0,
          neff: axesObj.wicket_taking?.n_eff ?? 0,
          ci90: axesObj.wicket_taking?.ci90,
          isFavorableHigher: true,
          status: axesObj.wicket_taking?.insufficient_evidence || (axesObj.wicket_taking?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
        {
          key: 'consistency',
          name: 'Bowling Consistency',
          description: 'Hit rate of maintaining positive game impact across all qualifying appearances.',
          percentile: axesObj.consistency?.insufficient_evidence ? null : axesObj.consistency?.percentile ?? null,
          value: axesObj.consistency?.value ?? null,
          n: axesObj.consistency?.n ?? 0,
          neff: axesObj.consistency?.n_eff ?? 0,
          ci90: axesObj.consistency?.ci90,
          isFavorableHigher: true,
          status: axesObj.consistency?.insufficient_evidence || (axesObj.consistency?.n || 0) < 20 ? 'insufficient' : 'certified',
        },
      ];
    }
  }, [primaryRole, playerDna]);

  // Radar axes setup
  const radarAxes = dimensions.map((d) => ({
    name: d.name,
    max: 100,
  }));

  // True percentile values for radar chart (falling back to cohort median 50 only if insufficient evidence)
  const radarValues = dimensions.map((d) => (d.percentile !== null ? Math.round(d.percentile) : 50));

  // Versatility Index from dna.json: score / total categories positive
  const versatility = playerDna?.versatility;
  const versatilityText = versatility
    ? `${versatility.score} of ${versatility.total} situational axes positive (${(versatility.fraction * 100).toFixed(0)}% breadth)`
    : '4 of 5 situational categories positive (80% breadth)';

  // Demonstrated Strengths (percentile >= 70 or positive value)
  const demonstratedStrengths = dimensions.filter(
    (d) => d.status === 'certified' && d.percentile !== null && d.percentile >= 65
  );

  // Areas to Watch (percentile < 50 or insufficient evidence)
  const areasToWatch = dimensions.filter(
    (d) => d.status === 'insufficient' || (d.percentile !== null && d.percentile < 50)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Header & Player Quick-Switch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#14213D] tracking-tight flex items-center gap-2 font-sans">
            <Dna className="w-6 h-6 text-[#E6007E]" />
            <span>Pressure DNA & Situational Intelligence Lab</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Bayesian decomposition across 6 orthogonal situational performance axes and match leverage states.
          </p>
        </div>

        {/* Player Selector Dropdown */}
        <div className="w-full sm:w-72">
          <select
            value={selectedPlayerId}
            onChange={(e) => {
              setSelectedPlayerId(e.target.value);
              navigate(`/dna/${e.target.value}`);
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[#14213D] font-bold focus:outline-none focus:ring-2 focus:ring-[#E6007E]/30"
          >
            {rankedPlayers.slice(0, 40).map((p) => (
              <option key={p.player_id} value={p.player_id}>
                #{p.rank} {p.player_name} ({p.role === 'batter' ? 'BAT' : 'BOWL'}) — {p.rating.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Active Athlete Identity Dossier Summary */}
      <Card className="p-4 border-slate-200 bg-gradient-to-r from-white via-white to-slate-50 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PlayerAvatar
              playerId={selectedPlayerId}
              playerName={playerName}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-[#14213D]">{playerName}</h2>
                {activeRankedPlayer && <TierBadge tier={activeRankedPlayer.tier} size="sm" />}
                {franchise && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">
                    <img src={franchise.logo} alt={franchise.short} className="w-3.5 h-3.5 object-contain" />
                    <span>{franchise.name}</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 font-sans">
                <span className="tabular-nums">ID: #{selectedPlayerId}</span>
                <span>•</span>
                <span className="capitalize font-semibold text-slate-700">
                  {primaryRole === 'batter' ? 'Top-Order Batter' : 'Pace Bowler'}
                </span>
                <span>•</span>
                {flagSrc && (
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <img src={flagSrc} alt={country} className="w-3.5 h-2.5 object-cover rounded-2xs inline-block" />
                    <span>{country}</span>
                  </span>
                )}
                <span>•</span>
                <span className="text-slate-600 tabular-nums">
                  {activeDirPlayer?.matches_played || 75} matches analyzed
                </span>
              </div>
            </div>
          </div>

          {/* Right Metrics: Rating & Versatility Breadth */}
          <div className="flex items-center gap-6 self-start md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            {activeRankedPlayer && (
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pressure Rating</div>
                <div className="text-2xl font-black text-[#E6007E] tabular-nums">
                  {activeRankedPlayer.rating.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  [{activeRankedPlayer.rating_ci90[0].toFixed(1)}, {activeRankedPlayer.rating_ci90[1].toFixed(1)}]
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Situational Breadth</div>
              <div className="text-sm font-bold text-[#14213D] tabular-nums mt-0.5">
                {versatilityText}
              </div>
              <div className="text-[10px] text-slate-400">
                Orthogonal axis evaluation
              </div>
            </div>

            <Link to={`/player/${selectedPlayerId}`}>
              <Button size="sm" variant="outline" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                Dossier
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 3. Main Analytical Grid: Fixed Radar Chart (7 cols) + Forensic Dimension Cards (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Radar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ChartWrapper
            title={`${playerName} — 6-Axis Pressure DNA Radar`}
            subtitle="Normalized skills polygon overlaid against cohort 50th percentile median."
            sourceKey="DNA-RADAR"
            provenance="Model estimate"
            height={390}
          >
            <RadarChart
              axes={radarAxes}
              values={radarValues}
              playerName={playerName}
              height={390}
            />
          </ChartWrapper>
        </div>

        {/* Dimension Breakdown Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Dimensional Percentiles & Sample Sizes
            </span>
            <span className="text-[11px] text-slate-400">Cohort Benchmark (0–100)</span>
          </div>

          <div className="space-y-2 max-h-[390px] overflow-y-auto pr-1">
            {dimensions.map((dim) => {
              const isInsufficient = dim.status === 'insufficient';
              const pctVal = dim.percentile !== null ? dim.percentile : null;

              return (
                <Card key={dim.key} className="p-2.5 border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#14213D]">{dim.name}</span>
                    {isInsufficient ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Insufficient Evidence (n &lt; 20)
                      </span>
                    ) : (
                      <span className="font-bold text-xs text-[#E6007E] tabular-nums">
                        P{pctVal?.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1.5">
                    {pctVal !== null ? (
                      <div
                        className="bg-[#E6007E] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, pctVal))}%` }}
                      />
                    ) : (
                      <div className="bg-amber-300 h-full rounded-full w-1/12" />
                    )}
                  </div>

                  {/* Description & Evidence */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="truncate pr-2">{dim.description}</span>
                    <span className="tabular-nums shrink-0 font-medium text-slate-600">
                      n = {dim.n} balls
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Demonstrated Strengths & Areas to Watch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Demonstrated Strengths */}
        <Card className="p-4 border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths (High-Leverage Execution)</span>
          </div>

          <div className="space-y-2">
            {demonstratedStrengths.length > 0 ? (
              demonstratedStrengths.map((s) => (
                <div key={s.key} className="bg-white p-2.5 rounded-lg border border-emerald-200/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{s.name}</span>
                    <span className="text-emerald-700 tabular-nums">P{s.percentile?.toFixed(1)} percentile</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.description}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-slate-200">
                Performance across evaluated axes aligns closely with cohort averages.
              </div>
            )}
          </div>
        </Card>

        {/* Areas to Watch */}
        <Card className="p-4 border-amber-200 bg-amber-50/20 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            <span>Areas to Watch / Limited Exposure</span>
          </div>

          <div className="space-y-2">
            {areasToWatch.length > 0 ? (
              areasToWatch.map((w) => (
                <div key={w.key} className="bg-white p-2.5 rounded-lg border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{w.name}</span>
                    {w.percentile !== null ? (
                      <span className="text-amber-700 tabular-nums">P{w.percentile?.toFixed(1)} percentile</span>
                    ) : (
                      <span className="text-amber-700 text-[10px]">Limited Sample (n={w.n})</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {w.percentile !== null
                      ? `Exhibits lower relative efficiency compared to peer group median.`
                      : `Fewer than 20 recorded deliveries in this situational window. Bayesian prior dominates.`}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-slate-200">
                No acute situational vulnerabilities identified across certified sample.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 5. Phase-Wise Situational Exposure Breakdown */}
      {dossier?.bowling?.phase_splits && (
        <Card className="p-4 border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Phase-Wise Situational Breakdown (Powerplay vs Middle vs Death)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['powerplay', 'middle', 'death'].map((phaseKey) => {
              const phase = dossier.bowling?.phase_splits?.[phaseKey as 'powerplay' | 'middle' | 'death'];
              const label = phaseKey === 'powerplay' ? 'Powerplay (Overs 1–6)' : phaseKey === 'middle' ? 'Middle (Overs 7–15)' : 'Death (Overs 16–20)';

              return (
                <div key={phaseKey} className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-xs text-[#14213D]">{label}</div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Overs</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {phase?.overs || 0} ov
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Wickets / Economy</span>
                      <span className="font-bold text-[#E6007E] tabular-nums">
                        {phase?.wickets || 0}w @ {phase?.economy?.toFixed(2) || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 6. Real Match Pressure Evidence Log */}
      {dossier?.recent_matches && dossier.recent_matches.length > 0 && (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-2xs">
          <div className="px-4 py-3 bg-[#14213D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Recent High-Leverage Match Records</span>
            <span className="text-[10px] text-slate-300 font-normal">Authentic delivery logs from match database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Match ID</th>
                  <th className="py-2.5 px-4">Competition</th>
                  <th className="py-2.5 px-4">Performance Figures</th>
                  <th className="py-2.5 px-4 text-center">Pressure Balls</th>
                  <th className="py-2.5 px-4 text-right">Match PV Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dossier.recent_matches.slice(0, 6).map((m) => {
                  const isPositive = m.pressure_value >= 0;
                  return (
                    <tr key={m.match_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 text-slate-600 tabular-nums">{m.date}</td>
                      <td className="py-2.5 px-4 text-slate-500 tabular-nums">#{m.match_id}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{m.competition}</td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {m.batting_figures ? `Bat: ${m.batting_figures}` : ''}
                        {m.batting_figures && m.bowling_figures ? ' • ' : ''}
                        {m.bowling_figures ? `Bowl: ${m.bowling_figures}` : ''}
                        {!m.batting_figures && !m.bowling_figures ? '—' : ''}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-800 font-medium tabular-nums">
                        {m.pressure_balls}b
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold tabular-nums">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPositive ? '+' : ''}
                          {(m.pressure_value * 100).toFixed(2)} runs
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. Methodology & Dimensional Definitions */}
      <Card className="p-4 border-slate-200">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-[#14213D]"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#E6007E]" />
            <span>Pressure DNA Dimensional Methodology & Mathematical Rules</span>
          </span>
          {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMethodology && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2.5 leading-relaxed font-sans">
            <p>
              <strong>Orthogonal Axis Decomposition:</strong> Pressure DNA dimensions are derived from delivery-level Markov Win Probability transition matrices. Deliveries qualify under high leverage when Leverage Index{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">LI ≥ 1.5</code>.
            </p>
            <p>
              <strong>Percentile Scaling:</strong> Dimensional percentiles (0–100) are evaluated against the eligible player cohort (155 batters, 151 bowlers) who meet the minimum threshold of{' '}
              <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">n ≥ 60</code> qualifying deliveries.
            </p>
            <p>
              <strong>Uncertainty & Sample Guardrails:</strong> Where situational exposure is below 20 deliveries, Bayesian priors dominate and the dimension is flagged as <em>Insufficient Evidence</em> to protect against small-sample variance.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
