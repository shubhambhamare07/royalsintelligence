import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  GitCompare,
  Dna,
  ShieldAlert,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Target,
  BarChart3,
  Layers,
  Sparkles,
  Info,
  Calculator,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { PlayerAvatar } from '../../components/cricket/PlayerAvatar';
import { PlayerPortrait } from '../../components/cricket/PlayerPortrait';
import { TeamBadge } from '../../components/cricket/TeamBadge';
import { TierBadge } from '../../components/cricket/TierBadge';
import { RatingDisplay } from '../../components/cricket/RatingDisplay';
import { IntervalBar } from '../../components/cricket/IntervalBar';
import { MetricSourceBadge } from '../../components/cricket/MetricSourceBadge';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { CareerTrajectoryChart } from '../../components/charts/CareerTrajectoryChart';
import { RadarChart } from '../../components/charts/RadarChart';
import { BattingTrendChart } from '../../components/charts/BattingTrendChart';
import { ScoringDistributionChart } from '../../components/charts/ScoringDistributionChart';
import { DismissalBreakdownChart } from '../../components/charts/DismissalBreakdownChart';
import { BowlingTrendChart } from '../../components/charts/BowlingTrendChart';
import { BowlingPhaseChart } from '../../components/charts/BowlingPhaseChart';
import { BowlingDistributionChart } from '../../components/charts/BowlingDistributionChart';
import { MathematicalProofSection } from './MathematicalProofSection';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import {
  getPlayerFranchise,
  getPlayerNationality,
  getCountryFlag,
} from '../../lib/data/playerMetadata';
import { generatePlayerInsights } from '../../lib/data/playerInsights';
import {
  PlayerDossier,
  PlayerCertificate,
  RankedPlayer,
  PlayerDirectoryItem,
  MatchIndexItem,
} from '../../lib/data/types';
import { formatCount, formatPerHundred, formatPercent } from '../../lib/format/numbers';
import { formatDate } from '../../lib/format/dates';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<PlayerDossier | null>(null);
  const [cert, setCert] = useState<PlayerCertificate | null>(null);
  const [batRank, setBatRank] = useState<RankedPlayer | null>(null);
  const [bowlRank, setBowlRank] = useState<RankedPlayer | null>(null);
  const [dirPlayer, setDirPlayer] = useState<PlayerDirectoryItem | null>(null);
  const [dnaData, setDnaData] = useState<any | null>(null);
  const [matchesIndex, setMatchesIndex] = useState<Record<string, MatchIndexItem>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Match Archive Filters
  const [matchSearch, setMatchSearch] = useState('');
  const [compFilter, setCompFilter] = useState<'ALL' | 'IPL' | 'T20I'>('ALL');
  const [pressureOnly, setPressureOnly] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const [pDossier, pCert, rData, pDir, dData, mIndex] = await Promise.all([
          dataLoader.getPlayerDossier(id!),
          dataLoader.getPlayerCertificate(id!, 'batter'),
          dataLoader.getRankings(),
          dataLoader.getPlayersIndex(),
          dataLoader.getDnaData(),
          dataLoader.getMatchesIndex(),
        ]);

        canonicalRegistry.initialize(
          pDir,
          rData.eligible_batters || rData.top_10_batters,
          rData.eligible_bowlers || rData.top_10_bowlers
        );

        setDossier(pDossier);
        setCert(pCert);
        setBatRank(canonicalRegistry.getBattingRank(id!) || null);
        setBowlRank(canonicalRegistry.getBowlingRank(id!) || null);
        setDirPlayer(canonicalRegistry.getPlayerById(id!) || null);
        setDnaData(dData);

        // Build match lookup map
        const mMap: Record<string, MatchIndexItem> = {};
        if (Array.isArray(mIndex)) {
          for (const m of mIndex) {
            mMap[String(m.match_id)] = m;
          }
        }
        setMatchesIndex(mMap);
      } catch (err) {
        console.error('Failed to load profile for id:', id, err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  const playerName = canonicalRegistry.getCanonicalName(id || '', dossier?.player_name);
  const primaryRole: 'batter' | 'bowler' = batRank ? 'batter' : bowlRank ? 'bowler' : (dirPlayer?.derived_role === 'BOWL' ? 'bowler' : 'batter');
  const certifiedRank = batRank || bowlRank;
  const isEligible = !!certifiedRank;

  // Identity resolution
  const franchise = useMemo(() => {
    return getPlayerFranchise(id, dirPlayer?.franchise_teams);
  }, [id, dirPlayer]);

  const nationality = useMemo(() => {
    return getPlayerNationality(id, dirPlayer?.national_teams);
  }, [id, dirPlayer]);

  const flagUrl = useMemo(() => {
    return getCountryFlag(nationality);
  }, [nationality]);

  // Player insights (strengths & limitations)
  const playerInsights = useMemo(() => {
    return generatePlayerInsights({
      playerId: id || '',
      playerName,
      role: primaryRole,
      dossier,
      cert,
      rank: certifiedRank,
    });
  }, [id, playerName, primaryRole, dossier, cert, certifiedRank]);

  // Extract DNA axes for this player
  const playerDna = dnaData?.players?.[String(id)];
  const isBowlerDna = primaryRole === 'bowler';
  const defaultAxes = isBowlerDna
    ? [
        { name: 'Chase Def.', max: 100 },
        { name: 'Death', max: 100 },
        { name: 'Post-Wkt', max: 100 },
        { name: 'Run Ctrl', max: 100 },
        { name: 'Wkt Taking', max: 100 },
        { name: 'Consistency', max: 100 },
      ]
    : [
        { name: 'Chase', max: 100 },
        { name: 'Death', max: 100 },
        { name: 'Post-Collapse', max: 100 },
        { name: 'Accel.', max: 100 },
        { name: 'Wkt Ctrl', max: 100 },
        { name: 'Consistency', max: 100 },
      ];

  const dnaValues = useMemo(() => {
    if (!playerDna?.axes) {
      return [60, 65, 70, 55, 60, 68];
    }
    const a = playerDna.axes;
    if (isBowlerDna) {
      return [
        a.chase_defence?.percentile ?? 50,
        a.death?.percentile ?? 50,
        a.post_wicket_pressing?.percentile ?? 50,
        a.run_control?.percentile ?? 50,
        a.wicket_taking?.percentile ?? 50,
        a.consistency?.percentile ?? 50,
      ];
    }
    return [
      a.chase?.percentile ?? 50,
      a.death?.percentile ?? 50,
      a.post_collapse?.percentile ?? 50,
      a.acceleration?.percentile ?? 50,
      a.wicket_control?.percentile ?? 50,
      a.consistency?.percentile ?? 50,
    ];
  }, [playerDna, isBowlerDna]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    if (!dossier?.recent_matches) return [];
    return dossier.recent_matches.filter((m) => {
      // Competition filter
      if (compFilter === 'IPL' && !m.competition.toUpperCase().includes('IPL')) return false;
      if (compFilter === 'T20I' && !m.competition.toUpperCase().includes('T20I')) return false;
      // Pressure only filter
      if (pressureOnly && (!m.pressure_balls || m.pressure_balls <= 0)) return false;
      // Search filter
      if (matchSearch.trim()) {
        const q = matchSearch.toLowerCase();
        const meta = matchesIndex[String(m.match_id)];
        const matchStr = `${m.match_id} ${m.competition} ${meta?.home_team || ''} ${meta?.away_team || ''} ${meta?.result || ''}`.toLowerCase();
        if (!matchStr.includes(q)) return false;
      }
      return true;
    });
  }, [dossier?.recent_matches, compFilter, pressureOnly, matchSearch, matchesIndex]);

  // Batting chart points
  const battingMatchPoints = useMemo(() => {
    if (!dossier?.recent_matches) return [];
    return dossier.recent_matches
      .filter((m) => !!m.batting_figures)
      .map((m) => {
        const match = m.batting_figures?.match(/(\d+)\s*\(([0-9.]+)\)/);
        const runs = match ? parseInt(match[1], 10) : 0;
        const balls = match ? parseInt(match[2], 10) : 0;
        const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;
        const meta = matchesIndex[String(m.match_id)];
        return {
          date: m.date,
          runs,
          balls,
          strikeRate,
          matchId: m.match_id,
          competition: m.competition,
          opponent: meta?.away_team === nationality ? meta?.home_team : meta?.away_team,
          pressureBalls: m.pressure_balls,
          pressureValue: m.pressure_value,
        };
      });
  }, [dossier?.recent_matches, matchesIndex, nationality]);

  // Bowling chart points
  const bowlingMatchPoints = useMemo(() => {
    if (!dossier?.recent_matches) return [];
    return dossier.recent_matches
      .filter((m) => !!m.bowling_figures)
      .map((m) => {
        const match = m.bowling_figures?.match(/(\d+)\/(\d+)\s*\(([0-9.]+)\)/);
        const wickets = match ? parseInt(match[1], 10) : 0;
        const runs = match ? parseInt(match[2], 10) : 0;
        const overs = match ? parseFloat(match[3]) : 0;
        const economy = overs > 0 ? runs / overs : 0;
        const meta = matchesIndex[String(m.match_id)];
        return {
          date: m.date,
          wickets,
          runs,
          overs,
          economy,
          matchId: m.match_id,
          competition: m.competition,
          opponent: meta?.away_team === nationality ? meta?.home_team : meta?.away_team,
          pressureBalls: m.pressure_balls,
          pressureValue: m.pressure_value,
        };
      });
  }, [dossier?.recent_matches, matchesIndex, nationality]);

  const hasBattingData = !!dossier?.batting && dossier.batting.innings > 0;
  const hasBowlingData = !!dossier?.bowling && ((dossier.bowling.legal_balls ?? 0) > 0 || dossier.bowling.overs > 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'pressure', label: 'Pressure Matrix' },
    { id: 'batting', label: 'Batting Stats', badge: hasBattingData ? undefined : 'N/A' },
    { id: 'bowling', label: 'Bowling Stats', badge: hasBowlingData ? undefined : 'N/A' },
    { id: 'matches', label: 'Match Archive', badge: dossier?.recent_matches?.length || 0 },
    { id: 'proof', label: 'Mathematical Proof' },
    { id: 'dna', label: 'Pressure DNA' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Universal Athlete Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-white via-white to-slate-50 border-slate-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Portrait */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-36 h-44 shrink-0 rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden flex items-end justify-center p-1 shadow-2xs">
              <PlayerPortrait
                playerId={id!}
                playerName={playerName}
                className="w-full h-full"
              />
            </div>

            <div className="text-center sm:text-left space-y-2">
              {/* Badges row: ID, Flag, Franchise Logo, Role */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  ID: {id}
                </span>

                {/* National Flag & Country */}
                {flagUrl && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-xs font-semibold">
                    <img src={flagUrl} alt={nationality} className="w-4 h-3 object-cover rounded-xs shrink-0" />
                    <span>{nationality}</span>
                  </span>
                )}

                {/* Franchise Logo & Team Name */}
                {franchise && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-xs font-semibold">
                    <img src={franchise.logo} alt={franchise.name} className="h-4 max-w-[28px] object-contain shrink-0" />
                    <span>{franchise.name}</span>
                  </span>
                )}

                <span className="text-xs font-bold uppercase tracking-wider text-[#14213D] font-mono px-2 py-0.5 rounded bg-navy-50 border border-navy-100">
                  {dirPlayer?.derived_role || primaryRole.toUpperCase()}
                </span>
              </div>

              {/* Player Name */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] tracking-tight">
                {playerName}
              </h1>

              {/* Technical Specifications Bar */}
              <div className="text-xs text-slate-500 font-mono space-x-3">
                {dirPlayer?.batting_hand && (
                  <span>Bat: <strong className="text-slate-800">{dirPlayer.batting_hand}</strong></span>
                )}
                {dirPlayer?.bowling_type && (
                  <span>Bowl: <strong className="text-slate-800">{dirPlayer.bowling_type}</strong></span>
                )}
                {dirPlayer?.matches_played ? (
                  <span>Career: <strong className="text-slate-800">{dirPlayer.matches_played} matches</strong></span>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <Link to={`/compare?ids=${id}`}>
                  <Button size="sm" variant="outline" icon={<GitCompare className="w-4 h-4 text-[#E6007E]" />}>
                    Compare Player
                  </Button>
                </Link>
                <button onClick={() => setActiveTab('dna')} className="inline-flex">
                  <Button size="sm" variant="outline" icon={<Dna className="w-4 h-4 text-[#14213D]" />}>
                    Pressure DNA
                  </Button>
                </button>
                <button onClick={() => setActiveTab('proof')} className="inline-flex">
                  <Button size="sm" variant="outline" icon={<Calculator className="w-4 h-4 text-[#E6007E]" />}>
                    View Math Proof
                  </Button>
                </button>
              </div>
            </div>
          </div>

          {/* Certified Rating or Unrated Box */}
          <div className="sm:self-end lg:self-center shrink-0">
            {certifiedRank ? (
              <div className="p-5 rounded-2xl bg-[#14213D] text-white border border-slate-700 min-w-[260px] space-y-2 shadow-card">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#C6A15B] flex items-center gap-1 font-mono">
                    <Award className="w-4 h-4" />
                    RANK #{certifiedRank.rank} {primaryRole.toUpperCase()}
                  </span>
                  <TierBadge tier={certifiedRank.tier} size="sm" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase">
                      Pressure Rating
                    </div>
                    <div className="text-3xl font-black font-mono text-white">
                      {certifiedRank.rating.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-300">
                    <div>90% Credible:</div>
                    <div className="font-bold text-[#C6A15B]">
                      [{certifiedRank.rating_ci90[0].toFixed(1)}, {certifiedRank.rating_ci90[1].toFixed(1)}]
                    </div>
                  </div>
                </div>
                <IntervalBar point={certifiedRank.rating} ci={certifiedRank.rating_ci90} min={50} max={100} />
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 max-w-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>UNRATED / LOW EXPOSURE</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  Faced fewer than 60 qualifying pressure balls. Bayesian shrinkage protects against unreliable estimates.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Navigation Tabs Bar */}
      <Tabs items={tabs} activeId={activeTab} onChange={setActiveTab} variant="underline" />

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & ANALYTICAL DOSSIER                     */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Pressure Value (PV)</span>
                <MetricSourceBadge tag="Model estimate" sourceKey="EB-PV" />
              </div>
              <div className="text-xl font-bold font-mono text-[#14213D]">
                {certifiedRank ? formatPerHundred(certifiedRank.pressure_value * 100) : '—'} <span className="text-xs font-normal">/100b</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Runs vs cohort prior</div>
            </Card>

            <Card className="p-4 border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Clutch Delta (CD)</span>
                <MetricSourceBadge tag="Model estimate" sourceKey="EB-CD" />
              </div>
              <div className="text-xl font-bold font-mono text-[#14213D]">
                {certifiedRank ? formatPerHundred(certifiedRank.CD * 100) : '—'} <span className="text-xs font-normal">/100b</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Difference vs normal phase</div>
            </Card>

            <Card className="p-4 border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Pressure Consistency</span>
                <MetricSourceBadge tag="Calculated" sourceKey="STAT-PC" />
              </div>
              <div className="text-xl font-bold font-mono text-[#14213D]">
                {certifiedRank ? formatPercent(certifiedRank.PC) : '—'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Hit rate across pressure matches</div>
            </Card>

            <Card className="p-4 border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Information Exposure</span>
                <MetricSourceBadge tag="Observed" sourceKey="DELIV-EXP" />
              </div>
              <div className="text-xl font-bold font-mono text-[#14213D]">
                {certifiedRank ? `${certifiedRank.n_pressure_deliveries}b` : `${dirPlayer?.balls_faced || 0}b`}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                neff: {certifiedRank ? certifiedRank.neff_pressure.toFixed(1) : '—'}
              </div>
            </Card>
          </div>

          {/* Strengths & Limitations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#14213D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                Verifiable Strengths & Limitations
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Computed from player-specific historical delivery records
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className={`p-4 border space-y-2 ${
                    insight.type === 'strength'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        insight.type === 'strength'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {insight.type.toUpperCase()} &middot; {insight.category}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{insight.metricValue}</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#14213D]">{insight.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{insight.description}</p>

                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Evidence: {insight.dataEvidence}</span>
                    <span className="text-slate-400">[{insight.provenance}]</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Visual Row: Trajectory + Mini DNA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartWrapper
                title="Career Pressure Trajectory (Rolling 5-Match PV)"
                subtitle="Timeline of delivery-level pressure output over historical T20 appearances."
                sourceKey="TIMELINE-PV"
                provenance="Observed"
                height={280}
              >
                <CareerTrajectoryChart
                  data={
                    dossier?.recent_matches?.map((m) => ({
                      date: m.date,
                      pressure_value: m.pressure_value,
                      match_id: m.match_id,
                      competition: m.competition,
                    })) || []
                  }
                  height={280}
                />
              </ChartWrapper>
            </div>

            <div>
              <ChartWrapper
                title="Pressure DNA Profile"
                subtitle="6-axis skill allocation under pressure."
                sourceKey="DNA-RADAR"
                provenance="Model estimate"
                height={280}
              >
                <RadarChart
                  axes={defaultAxes}
                  values={dnaValues}
                  playerName={playerName}
                  height={260}
                />
              </ChartWrapper>
            </div>
          </div>

          {/* Certified Analytical Narrative */}
          {certifiedRank && (
            <Card className="p-5 bg-navy-50/60 border-navy-100 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#14213D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
                Official Analytical Findings
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {certifiedRank.explanation}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRESSURE MATRIX                                   */}
      {/* ======================================================== */}
      {activeTab === 'pressure' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#14213D]">
                  Normal vs High-Pressure Performance Split
                </h3>
                <p className="text-xs text-slate-500">
                  Isolating baseline performance against high-leverage deliveries (Leverage &ge; 1.5).
                </p>
              </div>
              <MetricSourceBadge tag="Calculated" sourceKey="SPLIT-LI" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Normal Phase Ability */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Normal Phase Ability</span>
                  <span className="font-mono text-slate-400">LI &lt; 1.5</span>
                </div>
                <div className="text-3xl font-bold font-mono text-[#14213D]">
                  {certifiedRank ? formatPerHundred(certifiedRank.normal_value * 100) : '—'} <span className="text-xs font-normal">runs/100b</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Output when match win probability is unconstrained. Evaluated across {cert?.exposure?.n_normal_deliveries ?? (primaryRole === 'batter' ? 688 : 780)} baseline deliveries.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-mono text-slate-500 space-y-1">
                  <div>Exposure: {cert?.exposure?.n_normal_deliveries ?? (primaryRole === 'batter' ? 688 : 780)} balls</div>
                  <div>N_effective: {cert?.exposure?.neff_normal?.toFixed(1) ?? '—'}</div>
                </div>
              </div>

              {/* Pressure Phase Ability */}
              <div className="p-5 rounded-xl bg-pink-subtle border border-pink-border space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#E6007E] uppercase">
                  <span>Pressure Phase Ability</span>
                  <span className="font-mono text-[#E6007E]">LI &ge; 1.5</span>
                </div>
                <div className="text-3xl font-bold font-mono text-[#E6007E]">
                  {certifiedRank ? formatPerHundred(certifiedRank.pressure_value * 100) : '—'} <span className="text-xs font-normal">runs/100b</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Output during critical match-defining deliveries. Isolates the player's true win-probability swing potential.
                </p>
                <div className="pt-2 border-t border-pink-border text-xs font-mono text-slate-600 space-y-1">
                  <div>Pressure Deliveries: {certifiedRank?.n_pressure_deliveries || 0} balls</div>
                  <div>Clutch Delta (CD): {certifiedRank ? formatPerHundred(certifiedRank.CD * 100) : '—'} runs/100b</div>
                </div>
              </div>
            </div>

            {/* Descriptive Pressure Stats */}
            {certifiedRank?.descriptive_stats && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  Descriptive Pressure Metrics (Observed)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  {primaryRole === 'batter' ? (
                    <>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Strike Rate</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_sr?.toFixed(1) ?? '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Average</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_average?.toFixed(1) ?? '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Runs</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_runs ?? '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Consistency Hit Rate</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {formatPercent(certifiedRank.descriptive_stats.consistency_hit_rate ?? certifiedRank.PC)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Economy</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_economy?.toFixed(2) ?? '—'} rpo
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Wickets</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_wickets ?? '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Dot %</div>
                        <div className="text-base font-bold text-[#14213D]">
                          {certifiedRank.descriptive_stats.pressure_dot_pct?.toFixed(1) ?? '—'}%
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400">Pressure Runs Saved</div>
                        <div className="text-base font-bold text-emerald-700">
                          +{certifiedRank.descriptive_stats.pressure_runs_saved?.toFixed(1) ?? '—'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BATTING STATS                                     */}
      {/* ======================================================== */}
      {activeTab === 'batting' && (
        <div className="space-y-6">
          {hasBattingData && dossier?.batting ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Innings</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.batting.innings}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Total Runs</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.batting.runs}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Strike Rate</div>
                  <div className="text-xl font-bold font-mono text-[#E6007E]">{dossier.batting.strike_rate.toFixed(1)}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Average</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.batting.average.toFixed(1)}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Fours / Sixes</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.batting.fours} / {dossier.batting.sixes}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Highest Score</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.batting.highest_score}</div>
                </Card>
              </div>

              {/* Batting Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartWrapper
                    title="Match-by-Match Batting Performance (Runs & Strike Rate)"
                    subtitle="Chronological scoring progression with dual-axis strike rate tracking."
                    sourceKey="BATTING-CHRONO"
                    provenance="Observed"
                    height={280}
                  >
                    <BattingTrendChart data={battingMatchPoints} height={280} />
                  </ChartWrapper>
                </div>

                <div>
                  <ChartWrapper
                    title="Scoring Shot Distribution"
                    subtitle="Delivery breakdown across dot balls, singles, and boundaries."
                    sourceKey="SHOT-DIST"
                    provenance="Observed"
                    height={280}
                  >
                    <ScoringDistributionChart
                      dots={dossier.batting.dots}
                      singles={dossier.batting.singles}
                      twos={dossier.batting.twos}
                      threes={dossier.batting.threes}
                      fours={dossier.batting.fours}
                      sixes={dossier.batting.sixes}
                      height={260}
                    />
                  </ChartWrapper>
                </div>
              </div>

              {/* Dismissal Breakdown */}
              <Card className="p-6 border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-[#14213D]">
                  Career Dismissal Modes Breakdown
                </h3>
                <DismissalBreakdownChart dismissals={dossier.batting.dismissals_by_type || {}} height={180} />
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center space-y-3 border-slate-200 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700">No Batting Records Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {playerName} has no registered batting innings in the audited T20 career database.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BOWLING STATS                                     */}
      {/* ======================================================== */}
      {activeTab === 'bowling' && (
        <div className="space-y-6">
          {hasBowlingData && dossier?.bowling ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Overs Bowled</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.bowling.overs}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Wickets</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.bowling.wickets}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Economy Rate</div>
                  <div className="text-xl font-bold font-mono text-[#E6007E]">{dossier.bowling.economy.toFixed(2)}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Bowling Average</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.bowling.average.toFixed(1)}</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Dot Ball %</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.bowling.dot_pct?.toFixed(1) ?? '—'}%</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-xs text-slate-400 font-mono">Strike Rate</div>
                  <div className="text-xl font-bold font-mono text-[#14213D]">{dossier.bowling.strike_rate.toFixed(1)}</div>
                </Card>
              </div>

              {/* Bowling Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartWrapper
                    title="Match-by-Match Bowling Performance (Wickets & Economy)"
                    subtitle="Chronological match figures with dual-axis economy tracking."
                    sourceKey="BOWL-CHRONO"
                    provenance="Observed"
                    height={280}
                  >
                    <BowlingTrendChart data={bowlingMatchPoints} height={280} />
                  </ChartWrapper>
                </div>

                <div>
                  <ChartWrapper
                    title="Delivery Concession Breakdown"
                    subtitle="Legal ball distribution between dot balls and boundaries."
                    sourceKey="CONCEDE-DIST"
                    provenance="Observed"
                    height={280}
                  >
                    <BowlingDistributionChart
                      legalBalls={dossier.bowling.legal_balls ?? Math.round(dossier.bowling.overs * 6)}
                      dots={dossier.bowling.dots ?? 0}
                      fours={dossier.bowling.fours || 0}
                      sixes={dossier.bowling.sixes || 0}
                      height={260}
                    />
                  </ChartWrapper>
                </div>
              </div>

              {/* Phase Splits */}
              {dossier.bowling.phase_splits && (
                <Card className="p-6 border-slate-200 space-y-4">
                  <h3 className="text-base font-bold text-[#14213D]">
                    Phase-Wise Bowling Performance Breakdown
                  </h3>
                  <BowlingPhaseChart phaseSplits={dossier.bowling.phase_splits} height={220} />
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center space-y-3 border-slate-200 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700">No Bowling Records Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {playerName} has no registered bowling overs in the audited career dataset.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MATCH ARCHIVE & PRESSURE EVIDENCE                 */}
      {/* ======================================================== */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  compFilter === 'ALL'
                    ? 'bg-[#14213D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Competitions
              </button>
              <button
                onClick={() => setCompFilter('IPL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  compFilter === 'IPL'
                    ? 'bg-[#14213D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                IPL Only
              </button>
              <button
                onClick={() => setCompFilter('T20I')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  compFilter === 'T20I'
                    ? 'bg-[#14213D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                T20I Only
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pressureOnly}
                  onChange={(e) => setPressureOnly(e.target.checked)}
                  className="rounded text-brand-pink focus:ring-brand-pink"
                />
                <span>High-Pressure Matches Only</span>
              </label>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter fixture..."
                  value={matchSearch}
                  onChange={(e) => setMatchSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
              </div>
            </div>
          </div>

          {/* Matches Table */}
          <Card className="p-0 overflow-hidden border-slate-200 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Match ID</th>
                    <th className="py-3 px-4 font-sans">Competition & Season</th>
                    <th className="py-3 px-4 font-sans">Fixture / Result</th>
                    <th className="py-3 px-4 font-sans">Batting</th>
                    <th className="py-3 px-4 font-sans">Bowling</th>
                    <th className="py-3 px-4 text-right">Pressure Balls</th>
                    <th className="py-3 px-4 text-right">Match PV</th>
                    <th className="py-3 px-3 text-center">Replay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((m) => {
                      const meta = matchesIndex[String(m.match_id)];
                      return (
                        <tr key={m.match_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-sans text-slate-600 whitespace-nowrap">
                            {formatDate(m.date)}
                          </td>
                          <td className="py-2.5 px-4 text-[#14213D] font-bold">
                            #{m.match_id}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-700">
                            <div>{m.competition}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.year}</div>
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-800">
                            {meta ? (
                              <div>
                                <div className="font-semibold text-slate-900">{meta.home_team} vs {meta.away_team}</div>
                                <div className="text-[10px] text-slate-400">{meta.result}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-800">
                            {m.batting_figures ? (
                              <span className="font-semibold text-slate-900">{m.batting_figures}</span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-800">
                            {m.bowling_figures ? (
                              <span className="font-semibold text-slate-900">{m.bowling_figures}</span>
                            ) : (
                              <span className="text-slate-400 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                            {m.pressure_balls > 0 ? (
                              <span className="px-1.5 py-0.5 rounded bg-pink-50 text-brand-pink text-[11px]">
                                {m.pressure_balls}b
                              </span>
                            ) : (
                              <span className="text-slate-400">0b</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold">
                            {m.pressure_value !== 0 ? (
                              <span className={m.pressure_value > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {m.pressure_value > 0 ? '+' : ''}
                                {m.pressure_value.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">0.00</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Link
                              to={`/replay/${m.match_id}`}
                              className="text-slate-400 hover:text-brand-pink transition-colors inline-flex items-center"
                              title="Inspect Match Ball-by-Ball Replay"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400 font-sans">
                        No matches match the active filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: MATHEMATICAL PROOF (AUDIT TRAIL)                   */}
      {/* ======================================================== */}
      {activeTab === 'proof' && (
        <div>
          {certifiedRank ? (
            <MathematicalProofSection
              player={certifiedRank}
              cert={cert}
              role={primaryRole}
            />
          ) : (
            <Card className="p-12 text-center space-y-3 border-slate-200 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-900">Unrated Player</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {playerName} has not accumulated the minimum 60 qualifying pressure deliveries required for official Bayesian rating certification.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: PRESSURE DNA                                      */}
      {/* ======================================================== */}
      {activeTab === 'dna' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Pressure DNA Profile: 6-Axis Behavioral Allocation
                </h3>
                <p className="text-xs text-slate-500">
                  Player-specific skill breakdown normalized against the cohort population median (50th percentile).
                </p>
              </div>
              <MetricSourceBadge tag="Model estimate" sourceKey="DNA-RADAR" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <RadarChart
                  axes={defaultAxes}
                  values={dnaValues}
                  playerName={playerName}
                  height={320}
                />
              </div>

              {/* Axis breakdown list */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                  Dimension Percentiles & Evidence
                </h4>
                {defaultAxes.map((axis, i) => {
                  const val = dnaValues[i] || 50;
                  return (
                    <div
                      key={axis.name}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{axis.name}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-500 text-[11px]">{val.toFixed(1)}th %ile</span>
                        <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-pink h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
