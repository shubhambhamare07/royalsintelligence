import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  FastForward,
  Info,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import {
  PrivateMatchReplay,
  MatchSummaryData,
  MatchIndexItem,
  TurningPoint,
  PlayerContribution,
} from '../../lib/data/types';
import { WinProbTimelineChart } from '../../components/charts/WinProbTimelineChart';
import { PressureStrip } from '../../components/charts/PressureStrip';
import { Skeleton } from '../../components/ui/Skeleton';

export const MatchReplayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const matchId = id ? parseInt(id, 10) : 0;

  const [loading, setLoading] = useState(true);
  const [replay, setReplay] = useState<PrivateMatchReplay | null>(null);
  const [summary, setSummary] = useState<MatchSummaryData | null>(null);
  const [matchMeta, setMatchMeta] = useState<MatchIndexItem | null>(null);
  const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadMatchData() {
      if (!matchId) return;
      try {
        setLoading(true);
        const [repData, sumData, indexList] = await Promise.all([
          dataLoader.getPrivateMatchReplay(matchId),
          dataLoader.getMatchSummary(matchId),
          dataLoader.getMatchesIndex().catch(() => []),
        ]);

        setReplay(repData);
        setSummary(sumData);

        const foundMeta = indexList.find((m) => m.match_id === matchId) || null;
        setMatchMeta(foundMeta);
        setCurrentDeliveryIndex(0);
      } catch (err) {
        console.error('Failed to load match replay data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatchData();
  }, [matchId]);

  // Simulation playback ticker
  useEffect(() => {
    if (isPlaying && replay && replay.innings.length > 0) {
      const intervalMs = Math.floor(1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentDeliveryIndex((prev) => {
          if (prev >= replay.innings.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, replay]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Delivery total count
  const totalDeliveries = replay ? replay.innings.length : 0;
  const currIndex = Math.min(currentDeliveryIndex, Math.max(0, totalDeliveries - 1));

  // Current ball parameters if private data exists
  const currentInnings = replay ? replay.innings[currIndex] : 1;
  const currentOver = replay ? replay.over[currIndex] : 1;
  const currentBall = replay ? replay.ball[currIndex] : 1;
  const currentStrikerId = replay ? replay.striker_id[currIndex] : 0;
  const currentBowlerId = replay ? replay.bowler_id[currIndex] : 0;
  const currentStrikerName = canonicalRegistry.getCanonicalName(currentStrikerId);
  const currentBowlerName = canonicalRegistry.getCanonicalName(currentBowlerId);

  const currentScore = replay
    ? replay.score_before[currIndex] + replay.team_runs[currIndex]
    : 0;
  const currentWickets = replay
    ? replay.wkts_before[currIndex] + (replay.credited_wicket[currIndex] ? 1 : 0)
    : 0;
  const currentVBat = replay ? replay.v_bat[currIndex] : 0.5;
  const currentLi = replay ? replay.li[currIndex] : 1.0;
  const currentPressureBand = replay ? replay.pressure_band[currIndex] : 'Normal';
  const currentRrr = replay && replay.rrr ? replay.rrr[currIndex] : null;
  const currentTarget = replay && replay.target ? replay.target[currIndex] : null;

  // Jump to specific turning point
  const jumpToDelivery = (inn: number, ov: number, bl: number) => {
    if (!replay) return;
    const idx = replay.innings.findIndex(
      (inVal, i) => inVal === inn && replay.over[i] === ov && replay.ball[i] === bl
    );
    if (idx !== -1) {
      setCurrentDeliveryIndex(idx);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Match Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/matches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-pink transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Match Archive
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#14213D] text-white">
              MATCH #{matchId}
            </span>
            {matchMeta && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                {matchMeta.kind} {matchMeta.season}
              </span>
            )}
            {replay ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> BALL-BY-BALL ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> SUMMARY ARCHIVE
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {matchMeta ? `${matchMeta.home_team} vs ${matchMeta.away_team}` : `Match Replay #${matchId}`}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {matchMeta?.match_date} &middot; {matchMeta?.comp_name} &middot; Result: {matchMeta?.result || summary?.result}
          </p>
        </div>
      </div>

      {/* PRIVATE REPLAY MODE */}
      {replay ? (
        <div className="space-y-6">
          {/* Live HUD Banner: Active Scrubber State */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex flex-col items-center justify-center font-mono">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Inn {currentInnings}</span>
                <span className="text-lg font-extrabold text-white">
                  {currentOver}.{currentBall}
                </span>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Batting Score
                </div>
                <div className="text-3xl font-extrabold font-mono text-white">
                  {currentScore} <span className="text-slate-400 font-normal">/ {currentWickets}</span>
                </div>
                {currentTarget && (
                  <div className="text-[11px] font-mono text-pink-300">
                    Target: {currentTarget} {currentRrr ? `(RRR: ${currentRrr.toFixed(2)})` : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Striker & Bowler Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-[150px]">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Striker</span>
                <Link
                  to={`/player/${currentStrikerId}`}
                  className="font-bold text-white hover:text-brand-pink truncate block transition-colors"
                >
                  {currentStrikerName}
                </Link>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 min-w-[150px]">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Bowler</span>
                <Link
                  to={`/player/${currentBowlerId}`}
                  className="font-bold text-white hover:text-brand-pink truncate block transition-colors"
                >
                  {currentBowlerName}
                </Link>
              </div>
            </div>

            {/* Instantaneous Metrics: Win Prob & Leverage */}
            <div className="flex items-center gap-6">
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Win Prob</span>
                <span className="text-2xl font-extrabold text-brand-pink">
                  {(currentVBat * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Leverage</span>
                <span className="text-2xl font-extrabold text-white">
                  {currentLi.toFixed(2)}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase font-mono">Band</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase font-mono ${
                    currentPressureBand === 'Extreme'
                      ? 'bg-rose-500 text-white'
                      : currentPressureBand === 'High'
                      ? 'bg-amber-500 text-white'
                      : currentPressureBand === 'Elevated'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {currentPressureBand}
                </span>
              </div>
            </div>
          </div>

          {/* Win Probability Timeline Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Dynamic Win Probability Curve &amp; Turning Points
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step line of batting team win probability V(s). Diamond markers denote top 5 pivotal turning points.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-500">
                Delivery {currIndex + 1} of {totalDeliveries}
              </div>
            </div>

            <WinProbTimelineChart
              replay={replay}
              currentDeliveryIndex={currIndex}
              onSelectDeliveryIndex={(idx) => setCurrentDeliveryIndex(idx)}
              homeTeamName={matchMeta?.home_team}
              awayTeamName={matchMeta?.away_team}
              height="280px"
            />
          </div>

          {/* Continuous Pressure Timeline Strip */}
          <PressureStrip
            pressureBands={replay.pressure_band}
            innings={replay.innings}
            over={replay.over}
            ball={replay.ball}
            currentDeliveryIndex={currIndex}
            onSelectDeliveryIndex={(idx) => setCurrentDeliveryIndex(idx)}
          />

          {/* Interactive Delivery Scrubber Controls */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={Math.max(0, totalDeliveries - 1)}
                value={currIndex}
                onChange={(e) => setCurrentDeliveryIndex(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-pink"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-[#14213D] text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" /> Play Simulation
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCurrentDeliveryIndex((p) => Math.max(0, p - 1))}
                  disabled={currIndex === 0}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  title="Previous Delivery"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentDeliveryIndex((p) => Math.min(totalDeliveries - 1, p + 1))}
                  disabled={currIndex >= totalDeliveries - 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  title="Next Delivery"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentDeliveryIndex(0)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  title="Reset to Ball 1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {/* Speed buttons */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
                  <button
                    onClick={() => setPlaybackSpeed(1)}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded ${
                      playbackSpeed === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    1&times;
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(2)}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded ${
                      playbackSpeed === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    2&times;
                  </button>
                  <button
                    onClick={() => setPlaybackSpeed(5)}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded ${
                      playbackSpeed === 5 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    5&times;
                  </button>
                </div>
              </div>

              {/* Turning Point Quick Jump Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">
                  Pivotal Balls:
                </span>
                {replay.summary?.top_turning_points?.map((tp, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToDelivery(tp.innings, tp.over, tp.ball)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-pink-100 hover:text-brand-pink text-slate-700 font-mono text-[10px] font-bold transition-colors whitespace-nowrap"
                  >
                    I{tp.innings} {tp.over}.{tp.ball} (&Delta;V {(tp.delta_v * 100).toFixed(0)}%)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lower Details: Live Feed & Turning Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Feed around Current Index */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Synchronized Delivery Log</span>
                <span className="text-xs font-mono text-slate-400">
                  Window around Ball {currIndex + 1}
                </span>
              </h3>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {replay.innings
                  .map((_, i) => i)
                  .filter((i) => Math.abs(i - currIndex) <= 6)
                  .map((i) => {
                    const isCurrent = i === currIndex;
                    const inn = replay.innings[i];
                    const ov = replay.over[i];
                    const bl = replay.ball[i];
                    const striker = canonicalRegistry.getCanonicalName(replay.striker_id[i]);
                    const bowler = canonicalRegistry.getCanonicalName(replay.bowler_id[i]);
                    const runs = replay.bat_runs[i];
                    const teamRuns = replay.team_runs[i];
                    const isWkt = replay.credited_wicket[i];
                    const pb = replay.pressure_band[i];
                    const vBat = replay.v_bat[i];

                    return (
                      <div
                        key={i}
                        onClick={() => setCurrentDeliveryIndex(i)}
                        className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-pink-50 border-brand-pink ring-1 ring-brand-pink'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-7 rounded flex items-center justify-center font-bold text-[11px] ${
                              isCurrent ? 'bg-brand-pink text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ov}.{bl}
                          </span>
                          <div>
                            <div className="font-sans font-bold text-slate-900">
                              {striker} vs {bowler}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {isWkt ? (
                                <span className="text-rose-600 font-bold uppercase">Wicket!</span>
                              ) : (
                                <span>{teamRuns} run{teamRuns !== 1 ? 's' : ''}</span>
                              )}{' '}
                              &middot; Band: {pb}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-800">
                            {(vBat * 100).toFixed(1)}% V_bat
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Score: {replay.score_before[i] + teamRuns}/{replay.wkts_before[i] + (isWkt ? 1 : 0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Turning Points & Player Contributions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Pivotal Match Moments & Player WPA
              </h3>

              {/* Turning Points List */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Top Turning Points (&Delta;V Magnitude)
                </div>
                {replay.summary?.top_turning_points?.slice(0, 4).map((tp, i) => (
                  <div
                    key={i}
                    onClick={() => jumpToDelivery(tp.innings, tp.over, tp.ball)}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        Innings {tp.innings} &middot; Over {tp.over}.{tp.ball}
                      </span>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                        {canonicalRegistry.getCanonicalName(tp.striker_id)} facing{' '}
                        {canonicalRegistry.getCanonicalName(tp.bowler_id)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-pink text-sm">
                        &Delta;V = {(tp.delta_v * 100).toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-400">{tp.pressure_band} Band</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Player WPA Contributions */}
              {replay.summary?.player_contributions && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                    Net Win Probability Added (WPA) Leaders
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {replay.summary.player_contributions.slice(0, 4).map((pc, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center"
                      >
                        <span className="font-sans font-semibold text-slate-800 truncate mr-2">
                          {canonicalRegistry.getCanonicalName(pc.player_id)}
                        </span>
                        <span
                          className={`font-bold shrink-0 ${
                            pc.net_wpa >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {pc.net_wpa >= 0 ? '+' : ''}
                          {(pc.net_wpa * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* PUBLIC SUMMARY MODE (When private delivery JSON is omitted) */
        <div className="space-y-6">
          {/* Prominent Confidential Data Banner */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
              <h2 className="font-extrabold text-lg text-amber-950">
                Proprietary Research Notice &middot; Summary Mode
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              Full ball-by-ball delivery state vectors (<code className="font-mono bg-amber-100 px-1 rounded">v_bat</code>, <code className="font-mono bg-amber-100 px-1 rounded">li</code>, and instantaneous Markov transitions) are proprietary intellectual property of ROYALS INTELLIGENCE. In this public deployment, the research summary, reconstructed target metrics, and over-level pressure band distributions are accessible below.
            </p>
          </div>

          {/* Reconstructed Match Totals Card */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                  Innings 1 Total &amp; Model Star
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900">
                  {summary.innings_totals.innings_1?.toFixed(1) ?? 'N/A'} runs
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Target &sigma; = &plusmn;{summary.quality_flags.t1_sigma?.toFixed(1) ?? '3.6'} runs
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                  Innings 2 Total
                </div>
                <div className="text-2xl font-extrabold font-mono text-purple-700">
                  {summary.innings_totals.innings_2?.toFixed(1) ?? 'N/A'} runs
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Result: {summary.result}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                  Identified Turning Points
                </div>
                <div className="text-2xl font-extrabold font-mono text-brand-pink">
                  {summary.turning_point_count} Moments
                </div>
                <div className="text-xs text-slate-500">
                  High-leverage critical deliveries detected
                </div>
              </div>
            </div>
          )}

          {/* Over-by-Over Pressure Band Distribution Card */}
          {summary && summary.over_pressure_band_counts && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Over-by-Over Pressure Band Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Frequency of deliveries classified under Normal, Elevated, High, and Extreme pressure bands across match overs.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Over</th>
                      <th className="py-2.5 px-3 text-slate-600">Normal</th>
                      <th className="py-2.5 px-3 text-blue-600">Elevated</th>
                      <th className="py-2.5 px-3 text-amber-600">High</th>
                      <th className="py-2.5 px-3 text-rose-600">Extreme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(summary.over_pressure_band_counts).map(([ov, bands]) => (
                      <tr key={ov} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">Over {ov}</td>
                        <td className="py-2 px-3 text-slate-600">{bands['Normal'] || 0}</td>
                        <td className="py-2 px-3 text-blue-700 font-bold">{bands['Elevated'] || 0}</td>
                        <td className="py-2 px-3 text-amber-700 font-bold">{bands['High'] || 0}</td>
                        <td className="py-2 px-3 text-rose-700 font-bold">{bands['Extreme'] || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

