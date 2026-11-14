import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { computeDeliveryProbabilities, SIM_CLASSES } from '../lib/simulator/kernel';
import { MatchSimulatorEngine, SimulatorParams } from '../lib/simulator/engine';
import { SeededPRNG } from '../lib/simulator/prng';

describe('Phase 07C: Match Simulator Kernel & Parity Verification', () => {
  const publicDir = path.resolve(__dirname, '../../public/data');
  const paramsPath = path.join(publicDir, 'simulator/params.json');
  const goldenPath = path.join(publicDir, 'simulator/golden_cases.json');

  it('verifies simulator parameters file exists and has valid schemas', () => {
    expect(fs.existsSync(paramsPath)).toBe(true);
    const params: SimulatorParams = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));
    expect(params.model_version).toBe('simulator-v1.0');
    expect(params.classes).toEqual(['dot', 'non_boundary', 'boundary', 'wicket', 'extra']);
    expect(params.base_table).toBeDefined();
    expect(params.context_multipliers).toBeDefined();
    expect(params.players).toBeDefined();
    expect(params.priors).toBeDefined();
  });

  it('enforces delivery outcome probability normalization and non-negativity', () => {
    const baseP = [0.1294, 0.3560, 0.3622, 0.0146, 0.1377];
    const ctxM = [0.9189, 0.9972, 0.8512, 1.5242, 1.5700];
    const batTilt = [1.3010, 1.1882, 0.7659, 1.3829, 1.2328];
    const bowlTilt = [1.2502, 0.7897, 1.0153, 0.9596, 1.3487];

    const probs = computeDeliveryProbabilities(baseP, ctxM, batTilt, bowlTilt);
    expect(probs).toHaveLength(5);

    const sum = probs.reduce((acc, p) => acc + p, 0);
    expect(sum).toBeCloseTo(1.0, 7);

    probs.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  it('strictly validates TS kernel parity against 5,000 Python golden cases (tolerance <= 1e-7)', () => {
    expect(fs.existsSync(goldenPath)).toBe(true);
    const goldenCases: any[] = JSON.parse(fs.readFileSync(goldenPath, 'utf-8'));

    expect(goldenCases.length).toBe(5000);

    let maxDiff = 0;
    let passedCount = 0;
    const TOLERANCE = 1e-7;

    for (let i = 0; i < goldenCases.length; i++) {
      const g = goldenCases[i];
      const tsProbs = computeDeliveryProbabilities(
        g.base_probs,
        g.context_multipliers,
        g.bat_tilts,
        g.bowl_tilts
      );

      const pyProbs = [
        g.output_probabilities.dot,
        g.output_probabilities.non_boundary,
        g.output_probabilities.boundary,
        g.output_probabilities.wicket,
        g.output_probabilities.extra
      ];

      let casePassed = true;
      for (let k = 0; k < 5; k++) {
        const diff = Math.abs(tsProbs[k] - pyProbs[k]);
        if (diff > maxDiff) maxDiff = diff;
        if (diff > TOLERANCE) {
          casePassed = false;
        }
      }

      if (casePassed) passedCount++;
    }

    expect(passedCount).toBe(5000);
    expect(maxDiff).toBeLessThanOrEqual(TOLERANCE);
  });

  it('guarantees deterministic match simulation under fixed PRNG seed', () => {
    const params: SimulatorParams = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));
    const engine = new MatchSimulatorEngine(params);

    const battingXi = ['6931', '3993', '7915', '41', '8180', '9637', '4330', '4930', '13110', '11805', '12497'];
    const bowlingSquad = ['4330', '4930', '13110', '11805', '12497'];

    const rng1 = new SeededPRNG(4242);
    const sim1 = engine.simulateInnings(battingXi, bowlingSquad, null, false, rng1);

    const rng2 = new SeededPRNG(4242);
    const sim2 = engine.simulateInnings(battingXi, bowlingSquad, null, false, rng2);

    expect(sim1.score).toBe(sim2.score);
    expect(sim1.wickets).toBe(sim2.wickets);
    expect(sim1.legal_balls).toBe(sim2.legal_balls);
    expect(sim1.fours).toBe(sim2.fours);
    expect(sim1.sixes).toBe(sim2.sixes);

    // Invariants
    expect(sim1.wickets).toBeLessThanOrEqual(10);
    expect(sim1.legal_balls).toBeLessThanOrEqual(120);
    expect(sim1.score).toBeGreaterThanOrEqual(0);
  });

  it('verifies Monte Carlo batch distribution quantiles monotonicity', () => {
    const params: SimulatorParams = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));
    const engine = new MatchSimulatorEngine(params);

    const battingXi = ['6931', '3993', '7915', '41', '8180', '9637', '4330', '4930', '13110', '11805', '12497'];
    const bowlingSquad = ['4330', '4930', '13110', '11805', '12497'];

    const batch = engine.simulateMonteCarlo(
      battingXi,
      bowlingSquad,
      null,
      100,
      98765
    );

    expect(batch.n_sims).toBe(100);
    expect(batch.p10).toBeLessThanOrEqual(batch.p25);
    expect(batch.p25).toBeLessThanOrEqual(batch.median_score);
    expect(batch.median_score).toBeLessThanOrEqual(batch.p75);
    expect(batch.p75).toBeLessThanOrEqual(batch.p90);
    expect(batch.min_score).toBeLessThanOrEqual(batch.max_score);
  });
});

describe('Phase 07C: Governance, Anomaly & Population Invariants', () => {
  const publicDir = path.resolve(__dirname, '../../public/data');

  it('validates unredacted validation gate statuses in validation_wp.json', () => {
    const wpPath = path.join(publicDir, 'validation_wp.json');
    expect(fs.existsSync(wpPath)).toBe(true);
    const wp = JSON.parse(fs.readFileSync(wpPath, 'utf-8'));

    // Master Gate G2 must be FAIL (Unredacted statistical disclosure)
    expect(wp.overall_gate_g2).toBe('FAIL');
    expect(wp.gates.G_G1.status).toBe('FAIL');
    expect(wp.gates.G_G1.ece).toBeCloseTo(0.0905, 3);
    expect(wp.gates.G_G1.ece).toBeGreaterThan(wp.gates.G_G1.max_ece_threshold);

    // Gates G_T1, G_A1, G_B, G_C2 must be PASS
    expect(wp.gates.G_T1.status).toBe('PASS');
    expect(wp.gates.G_A1.status).toBe('PASS');
    expect(wp.gates.G_B.status).toBe('PASS');
    expect(wp.gates.G_C2.status).toBe('PASS');
    expect(wp.gates.CANONICAL_STATES.status).toBe('PASS');
  });

  it('validates simulator validation gate G-G7 failure in validation_simulator.json', () => {
    const simPath = path.join(publicDir, 'validation_simulator.json');
    expect(fs.existsSync(simPath)).toBe(true);
    const sim = JSON.parse(fs.readFileSync(simPath, 'utf-8'));

    expect(sim.gate).toBe('G-G7');
    expect(sim.status).toBe('FAIL');
    expect(sim.validated).toBe(false);
    expect(sim.summary.overall.mean_bias).toBeCloseTo(10.123, 2);
    expect(sim.summary.overall.gate_bias_pass).toBe(false);
    expect(sim.summary.overall.crps_beats_baseline).toBe(true);
  });

  it('validates anomaly dataset threshold and count invariants', () => {
    const anomPath = path.join(publicDir, 'anomalies.json');
    expect(fs.existsSync(anomPath)).toBe(true);
    const anom = JSON.parse(fs.readFileSync(anomPath, 'utf-8'));

    expect(anom.threshold).toBe(2.5);
    expect(anom.counts.total_anomalies).toBe(1782);
    expect(anom.top_20_anomalies.length).toBe(20);

    anom.top_20_anomalies.forEach((a: any) => {
      expect(Math.abs(a.z_score)).toBeGreaterThanOrEqual(2.5);
      expect(a.match_id).toBeDefined();
      expect(a.player_name).toBeDefined();
    });
  });

  it('reconciles authoritative population counts across frozen rankings and directory', () => {
    const rankingsPath = path.join(publicDir, 'rankings.json');
    const directoryPath = path.join(publicDir, 'players_index.json');

    const rankings = JSON.parse(fs.readFileSync(rankingsPath, 'utf-8'));
    const directory = JSON.parse(fs.readFileSync(directoryPath, 'utf-8'));

    // 155 qualified batters, 151 qualified bowlers
    expect(rankings.counts.eligible_batters).toBe(155);
    expect(rankings.counts.eligible_bowlers).toBe(151);

    // 959 total players in index
    expect(directory.length).toBe(959);
  });
});
