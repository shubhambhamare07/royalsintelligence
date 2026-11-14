/**
 * site/src/lib/simulator/engine.ts
 *
 * Monte Carlo Match Simulation Engine in TypeScript.
 * Faithfully reproduces Python models/simulator/engine.py:
 *   - 120 legal balls maximum per innings
 *   - 10 wickets maximum (or len(batting_xi) - 1)
 *   - Bowler allocation by empirical phase weights (max 4 overs, no consecutive overs)
 *   - Strike rotation on odd runs & end-of-over
 *   - Run-outs vs Bowler-credited wickets (5.65% run-out chance on wicket)
 *   - Free hits triggered by no-balls (run-out only on free hits)
 *   - Parameter uncertainty propagated via Gamma posterior sampling once per simulation
 */

import { computeDeliveryProbabilities, SIM_CLASSES } from './kernel';
import { SeededPRNG } from './prng';

export const NB_RUNS_CHOICES = [1, 2, 3];
export const NB_RUNS_WEIGHTS = [0.8464, 0.1460, 0.0076];

export const BOUNDARY_CHOICES = [4, 6];
export const BOUNDARY_WEIGHTS = [0.6455, 0.3545];

export const RUNOUT_SHARE_STRIKER = 328.0 / (328.0 + 270.0); // 0.5485
export const RUNOUT_CHANCE_ON_WICKET = 0.0565;
export const WIDE_SHARE_OF_EXTRAS = 0.902;

export interface PlayerParam {
  id: number;
  bat?: {
    ready: boolean;
    exp: number;
    shape: number[];
    rate: number[];
    mean: number[];
  };
  bowl?: {
    ready: boolean;
    exp: number;
    type: 'pace' | 'spin' | string;
    phase_weights: { pp: number; mid: number; death: number };
    shape: number[];
    rate: number[];
    mean: number[];
  };
}

export interface SimulatorParams {
  model_version: string;
  classes: string[];
  priors: {
    batter: Record<string, number>;
    bowler: Record<string, number>;
  };
  base_table: number[][][][];
  context_multipliers: Record<string, number[]>;
  players: Record<string, PlayerParam>;
  validation?: any;
  limitations?: string;
}

export interface InningsSimulationOutput {
  score: number;
  wickets: number;
  legal_balls: number;
  target_reached: boolean;
  pp_runs: number;
  mid_runs: number;
  death_runs: number;
  fours: number;
  sixes: number;
  bat_stats: Record<string, { runs: number; balls: number; out: number }>;
  bowl_stats: Record<string, { runs: number; balls: number; wickets: number }>;
}

export interface SimulationResults {
  n_sims: number;
  mean_score: number;
  median_score: number;
  min_score: number;
  max_score: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  mean_wickets: number;
  mean_pp_runs: number;
  mean_mid_runs: number;
  mean_death_runs: number;
  mean_fours: number;
  mean_sixes: number;
  win_prob?: number;
  win_prob_se?: number;
  score_distribution: { score: number; count: number }[];
  duration_ms: number;
  model_version: string;
}

export class MatchSimulatorEngine {
  constructor(private params: SimulatorParams) {}

  private sampleTiltVector(
    role: 'batter' | 'bowler',
    playerId: number | string,
    rng: SeededPRNG,
    includeLowEvidence: boolean = false
  ): number[] {
    const pRecord = this.params.players[String(playerId)];
    const roleObj = role === 'batter' ? pRecord?.bat : pRecord?.bowl;

    if (!roleObj || !roleObj.ready) {
      if (!includeLowEvidence) {
        // Fallback to prior
      }
      const priors = role === 'batter' ? this.params.priors.batter : this.params.priors.bowler;
      const tilts = new Array(5);
      for (let i = 0; i < 5; i++) {
        const clsName = SIM_CLASSES[i];
        const rk = priors?.[clsName] ?? 50.0;
        tilts[i] = rng.gamma(rk, rk);
      }
      return tilts;
    }

    const tilts = new Array(5);
    for (let i = 0; i < 5; i++) {
      const alpha = roleObj.shape[i];
      const beta = roleObj.rate[i];
      tilts[i] = rng.gamma(alpha, beta);
    }
    return tilts;
  }

  private selectBowler(
    bowlingSquad: (number | string)[],
    oversBowled: Record<string, number>,
    prevBowler: string | null,
    overNum: number,
    rng: SeededPRNG
  ): string {
    const phase: 'pp' | 'mid' | 'death' =
      overNum < 6 ? 'pp' : overNum < 15 ? 'mid' : 'death';

    const candidates = bowlingSquad
      .map(String)
      .filter((b) => (oversBowled[b] || 0) < 4 && (b !== prevBowler || bowlingSquad.length === 1));

    if (candidates.length === 0) {
      const remaining = bowlingSquad.map(String).filter((b) => (oversBowled[b] || 0) < 4);
      return remaining[0] || String(bowlingSquad[0]);
    }

    const weights = candidates.map((b) => {
      const prof = this.params.players[b]?.bowl;
      const w = prof?.phase_weights?.[phase] ?? 0.33;
      return Math.max(0.01, w);
    });

    const chosenIdx = rng.choice(weights);
    return candidates[chosenIdx];
  }

  public simulateInnings(
    battingXi: (number | string)[],
    bowlingSquad: (number | string)[],
    target: number | null = null,
    includeLowEvidence: boolean = false,
    rng: SeededPRNG
  ): InningsSimulationOutput {
    const isChase = target !== null;
    const maxWickets = Math.min(10, battingXi.length - 1);

    // 1. Draw tilts once per simulation
    const batDrawnTilts: Record<string, number[]> = {};
    for (const bId of battingXi) {
      batDrawnTilts[String(bId)] = this.sampleTiltVector('batter', bId, rng, includeLowEvidence);
    }

    const bowlDrawnTilts: Record<string, number[]> = {};
    for (const bwId of bowlingSquad) {
      bowlDrawnTilts[String(bwId)] = this.sampleTiltVector('bowler', bwId, rng, includeLowEvidence);
    }

    // 2. Tracking state
    let score = 0;
    let wickets = 0;
    let legalBalls = 0;
    let freeHit = false;

    let ppRuns = 0;
    let midRuns = 0;
    let deathRuns = 0;
    let fours = 0;
    let sixes = 0;

    let strikerIdx = 0;
    let nonStrikerIdx = 1;
    let nextBatterIdx = 2;

    const oversBowled: Record<string, number> = {};
    for (const b of bowlingSquad) {
      oversBowled[String(b)] = 0;
    }

    let prevBowler: string | null = null;
    let currentBowler = this.selectBowler(bowlingSquad, oversBowled, prevBowler, 0, rng);

    const batStats: Record<string, { runs: number; balls: number; out: number }> = {};
    for (const b of battingXi) {
      batStats[String(b)] = { runs: 0, balls: 0, out: 0 };
    }

    const bowlStats: Record<string, { runs: number; balls: number; wickets: number }> = {};
    for (const b of bowlingSquad) {
      bowlStats[String(b)] = { runs: 0, balls: 0, wickets: 0 };
    }

    while (legalBalls < 120 && wickets < maxWickets) {
      const overNum = Math.floor(legalBalls / 6);
      const ballsLeft = 120 - legalBalls;

      // Determine context key
      let nbKey = 'innings_1';
      if (isChase && target !== null) {
        const runsNeeded = target - score;
        const rrr = (runsNeeded * 6.0) / Math.max(1.0, ballsLeft);
        const crr = (score * 6.0) / Math.max(1.0, legalBalls);
        const gap = rrr - crr;
        nbKey = gap < -2.0 ? 'ahead' : gap > 2.0 ? 'behind' : 'even';
      }

      const obKey = strikerIdx < 3 ? 'top' : strikerIdx < 7 ? 'middle' : 'tail';
      const btKey = this.params.players[currentBowler]?.bowl?.type === 'spin' ? 'spin' : 'pace';
      const contextKey = `${nbKey}:${obKey}:${btKey}`;

      // Probability vector
      const wktIdx = Math.min(9, wickets);
      const fhIdx = freeHit ? 1 : 0;
      const baseP = this.params.base_table[ballsLeft]?.[wktIdx]?.[fhIdx] ?? [0.3, 0.42, 0.18, 0.05, 0.05];
      const ctxM = this.params.context_multipliers[contextKey] ?? [1.0, 1.0, 1.0, 1.0, 1.0];

      const strikerId = String(battingXi[strikerIdx] || battingXi[0]);
      const bTilt = batDrawnTilts[strikerId] || [1, 1, 1, 1, 1];
      const bwTilt = bowlDrawnTilts[currentBowler] || [1, 1, 1, 1, 1];

      const pVec = computeDeliveryProbabilities(baseP, ctxM, bTilt, bwTilt);

      // Sample outcome
      let outcomeCls = rng.choice(pVec);

      // Free hit check
      if (freeHit && outcomeCls === 3) {
        if (rng.random() > RUNOUT_CHANCE_ON_WICKET) {
          outcomeCls = 0; // Nullified to dot ball
        }
      }

      // Resolve outcome
      if (outcomeCls === 0) {
        // dot
        legalBalls++;
        batStats[strikerId].balls++;
        bowlStats[currentBowler].balls++;
        freeHit = false;
      } else if (outcomeCls === 1) {
        // non_boundary
        const rIdx = rng.choice(NB_RUNS_WEIGHTS);
        const r = NB_RUNS_CHOICES[rIdx];
        legalBalls++;
        score += r;
        batStats[strikerId].runs += r;
        batStats[strikerId].balls++;
        bowlStats[currentBowler].runs += r;
        bowlStats[currentBowler].balls++;

        if (overNum < 6) ppRuns += r;
        else if (overNum < 15) midRuns += r;
        else deathRuns += r;

        if (r % 2 === 1) {
          const tmp = strikerIdx;
          strikerIdx = nonStrikerIdx;
          nonStrikerIdx = tmp;
        }
        freeHit = false;
      } else if (outcomeCls === 2) {
        // boundary
        const rIdx = rng.choice(BOUNDARY_WEIGHTS);
        const r = BOUNDARY_CHOICES[rIdx];
        legalBalls++;
        score += r;
        batStats[strikerId].runs += r;
        batStats[strikerId].balls++;
        bowlStats[currentBowler].runs += r;
        bowlStats[currentBowler].balls++;

        if (r === 4) fours++;
        else sixes++;

        if (overNum < 6) ppRuns += r;
        else if (overNum < 15) midRuns += r;
        else deathRuns += r;

        freeHit = false;
      } else if (outcomeCls === 3) {
        // wicket
        legalBalls++;
        wickets++;
        bowlStats[currentBowler].balls++;

        if (!freeHit && rng.random() > RUNOUT_CHANCE_ON_WICKET) {
          // Bowler credited
          bowlStats[currentBowler].wickets++;
          batStats[strikerId].balls++;
          batStats[strikerId].out = 1;
          if (nextBatterIdx < battingXi.length) {
            strikerIdx = nextBatterIdx;
            nextBatterIdx++;
          }
        } else {
          // Run out
          if (rng.random() < RUNOUT_SHARE_STRIKER) {
            batStats[strikerId].balls++;
            batStats[strikerId].out = 1;
            if (nextBatterIdx < battingXi.length) {
              strikerIdx = nextBatterIdx;
              nextBatterIdx++;
            }
          } else {
            const nonId = String(battingXi[nonStrikerIdx]);
            if (batStats[nonId]) batStats[nonId].out = 1;
            if (nextBatterIdx < battingXi.length) {
              nonStrikerIdx = nextBatterIdx;
              nextBatterIdx++;
            }
          }
        }
        freeHit = false;
      } else if (outcomeCls === 4) {
        // extra
        score += 1;
        bowlStats[currentBowler].runs += 1;
        if (overNum < 6) ppRuns += 1;
        else if (overNum < 15) midRuns += 1;
        else deathRuns += 1;

        if (rng.random() > WIDE_SHARE_OF_EXTRAS) {
          freeHit = true; // No-ball
        }
      }

      // Check target in chase
      if (isChase && target !== null && score >= target) {
        break;
      }

      // Check over completion
      if (outcomeCls !== 4 && legalBalls % 6 === 0 && legalBalls < 120 && wickets < maxWickets) {
        oversBowled[currentBowler] = (oversBowled[currentBowler] || 0) + 1;
        prevBowler = currentBowler;
        // Swap ends
        const tmp = strikerIdx;
        strikerIdx = nonStrikerIdx;
        nonStrikerIdx = tmp;
        currentBowler = this.selectBowler(
          bowlingSquad,
          oversBowled,
          prevBowler,
          Math.floor(legalBalls / 6),
          rng
        );
      }
    }

    return {
      score,
      wickets,
      legal_balls: legalBalls,
      target_reached: Boolean(isChase && target !== null && score >= target),
      pp_runs: ppRuns,
      mid_runs: midRuns,
      death_runs: deathRuns,
      fours,
      sixes,
      bat_stats: batStats,
      bowl_stats: bowlStats,
    };
  }

  public simulateMonteCarlo(
    battingXi: (number | string)[],
    bowlingSquad: (number | string)[],
    target: number | null = null,
    nSims: number = 2000,
    seed: number = 42,
    includeLowEvidence: boolean = false,
    onProgress?: (simulated: number, total: number) => void
  ): SimulationResults {
    const startTime = performance.now();
    const rng = new SeededPRNG(seed);

    const totals: number[] = new Array(nSims);
    const wicketsArr: number[] = new Array(nSims);
    const ppRunsArr: number[] = new Array(nSims);
    const midRunsArr: number[] = new Array(nSims);
    const deathRunsArr: number[] = new Array(nSims);
    const foursArr: number[] = new Array(nSims);
    const sixesArr: number[] = new Array(nSims);
    let targetReachedCount = 0;

    const reportInterval = Math.max(10, Math.floor(nSims / 20));

    for (let i = 0; i < nSims; i++) {
      const res = this.simulateInnings(battingXi, bowlingSquad, target, includeLowEvidence, rng);
      totals[i] = res.score;
      wicketsArr[i] = res.wickets;
      ppRunsArr[i] = res.pp_runs;
      midRunsArr[i] = res.mid_runs;
      deathRunsArr[i] = res.death_runs;
      foursArr[i] = res.fours;
      sixesArr[i] = res.sixes;
      if (res.target_reached) targetReachedCount++;

      if (onProgress && (i + 1) % reportInterval === 0) {
        onProgress(i + 1, nSims);
      }
    }

    if (onProgress) {
      onProgress(nSims, nSims);
    }

    // Sort totals for quantiles
    const sorted = [...totals].sort((a, b) => a - b);
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    const q = (p: number) => sorted[Math.floor(p * (nSims - 1))];

    // Score distribution frequency map
    const freqMap: Record<number, number> = {};
    for (const t of totals) {
      freqMap[t] = (freqMap[t] || 0) + 1;
    }
    const scoreDistribution = Object.entries(freqMap)
      .map(([s, c]) => ({ score: Number(s), count: c }))
      .sort((a, b) => a.score - b.score);

    const durationMs = Math.round(performance.now() - startTime);

    let winProb: number | undefined;
    let winProbSe: number | undefined;
    if (target !== null) {
      winProb = targetReachedCount / nSims;
      winProbSe = Math.sqrt((winProb * (1.0 - winProb)) / nSims);
    }

    return {
      n_sims: nSims,
      mean_score: Math.round((sum(totals) / nSims) * 10) / 10,
      median_score: q(0.5),
      min_score: sorted[0],
      max_score: sorted[sorted.length - 1],
      p10: q(0.1),
      p25: q(0.25),
      p75: q(0.75),
      p90: q(0.9),
      mean_wickets: Math.round((sum(wicketsArr) / nSims) * 10) / 10,
      mean_pp_runs: Math.round((sum(ppRunsArr) / nSims) * 10) / 10,
      mean_mid_runs: Math.round((sum(midRunsArr) / nSims) * 10) / 10,
      mean_death_runs: Math.round((sum(deathRunsArr) / nSims) * 10) / 10,
      mean_fours: Math.round((sum(foursArr) / nSims) * 10) / 10,
      mean_sixes: Math.round((sum(sixesArr) / nSims) * 10) / 10,
      win_prob: winProb,
      win_prob_se: winProbSe,
      score_distribution: scoreDistribution,
      duration_ms: durationMs,
      model_version: this.params.model_version,
    };
  }
}

