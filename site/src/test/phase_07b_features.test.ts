import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 07B: Advanced Analytics & Research Data Integrity', () => {
  const dataDir = path.resolve(__dirname, '../../public/data');
  const privateDir = path.resolve(__dirname, '../../public/data/private/matches');

  it('Sensitivity Lab: verifies 500 MC simulations, overlap frequencies and fragile picks', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'sensitivity/summary.json'), 'utf-8');
    const sens = JSON.parse(raw);

    expect(sens.n_simulations).toBe(500);
    expect(sens.mean_bat_top10_overlap).toBeCloseTo(0.2894, 3);
    expect(sens.mean_bowl_top10_overlap).toBeCloseTo(0.2148, 3);

    // Fragile picks
    expect(Array.isArray(sens.fragile_picks_batters)).toBe(true);
    expect(sens.fragile_picks_batters.length).toBeGreaterThanOrEqual(4);
    expect(sens.fragile_picks_batters).toContain('3672'); // Kusal Mendis
    expect(sens.fragile_picks_batters).toContain('3916'); // Shimron Hetmyer

    expect(Array.isArray(sens.fragile_picks_bowlers)).toBe(true);
    expect(sens.fragile_picks_bowlers.length).toBeGreaterThanOrEqual(6);
    expect(sens.fragile_picks_bowlers).toContain('7327'); // Rashid Khan
    expect(sens.fragile_picks_bowlers).toContain('7920'); // Pat Cummins

    // Inclusion probabilities
    Object.values(sens.primary_top10_batters_inclusion_freq).forEach((freq) => {
      expect(freq).toBeGreaterThanOrEqual(0.0);
      expect(freq).toBeLessThanOrEqual(1.0);
    });
  });

  it('Methodology: verifies Plan C parameters, calibration slope, and canonical test states', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'methodology.json'), 'utf-8');
    const meth = JSON.parse(raw);

    expect(meth.live_model).toBe('Plan C (Transparent Logistic CDI)');
    expect(meth.chase_win_probability.plan_c_calibration_slope).toBeCloseTo(1.1353, 4);
    expect(meth.chase_win_probability.plan_c_brier).toBeCloseTo(0.1353, 4);
    expect(meth.chase_win_probability.ece).toBeCloseTo(0.0905, 4);
    expect(meth.chase_win_probability.separation).toBeCloseTo(0.4711, 4);
    expect(meth.chase_win_probability.gate_g_g1).toBe('PASS');

    // Canonical States
    expect(meth.canonical_states.CS1_comfortable_19th_over).toBeDefined();
    expect(meth.canonical_states.CS2_tense_13th_over).toBeDefined();
    expect(meth.canonical_states.CS3_tense_19th_over).toBeDefined();
    expect(meth.canonical_states.CS3_tense_19th_over.status).toBe('PASS');
    expect(meth.canonical_states.CS3_tense_19th_over.PI_global).toBeGreaterThan(90.0);
  });

  it('Transferability: verifies Spearman correlation, disattenuation and sample sizes', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'transferability.json'), 'utf-8');
    const trans = JSON.parse(raw);

    const bat = trans.batter_transferability;
    expect(bat.n_qualified).toBe(46);
    expect(bat.spearman_rho).toBeCloseTo(0.3449, 4);
    expect(bat.p_value).toBeCloseTo(0.0189, 4);
    expect(bat.rho_disattenuated).toBeCloseTo(1.0, 1);
    expect(bat.scatter_points.length).toBe(46);

    const bowl = trans.bowler_transferability;
    expect(bowl.n_qualified).toBe(44);
    expect(bowl.scatter_points.length).toBe(44);

    // Check point properties
    const sample = bat.scatter_points[0];
    expect(sample.player_name).toBeDefined();
    expect(sample.ipl_exposure).toBeGreaterThanOrEqual(60);
    expect(sample.t20i_exposure).toBeGreaterThanOrEqual(60);
    expect(sample.ipl_ci90.length).toBe(2);
    expect(sample.t20i_ci90.length).toBe(2);
  });

  it('Hidden Gems: verifies 11 gems, outperform probability threshold, and concealment flags', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'hidden_gems.json'), 'utf-8');
    const gems = JSON.parse(raw);

    expect(gems.counts.total_gems).toBe(11);
    expect(gems.counts.gem_batters).toBe(10);
    expect(gems.counts.gem_bowlers).toBe(1);

    const allGems = [...gems.gem_batters, ...gems.gem_bowlers];
    expect(allGems.length).toBe(11);

    allGems.forEach((g) => {
      expect(g.p_outperform).toBeGreaterThanOrEqual(0.80);
      expect(g.low_exposure_flag || g.low_rate_flag).toBe(true);
      expect(g.rating).toBeGreaterThan(0);
      expect(g.rating_ci90.length).toBe(2);
      expect(g.reason_string).toBeDefined();
    });

    // Check bowler gem (Mustafizur Rahman)
    expect(gems.gem_bowlers[0].player_name).toBe('Mustafizur Rahman');
    expect(gems.gem_bowlers[0].p_outperform).toBeCloseTo(0.8113, 3);
  });

  it('Match Archive: verifies 883 matches indexed with reconstructed target metrics', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'matches_index.json'), 'utf-8');
    const matches = JSON.parse(raw);

    expect(matches.length).toBe(883);

    const iplMatches = matches.filter((m: any) => m.kind === 'IPL');
    const t20iMatches = matches.filter((m: any) => m.kind === 'T20I');
    const otherMatches = matches.filter((m: any) => m.kind === 'OTHER_T20');

    expect(iplMatches.length).toBe(371);
    expect(t20iMatches.length).toBe(482);
    expect(otherMatches.length).toBe(30);
    expect(iplMatches.length + t20iMatches.length + otherMatches.length).toBe(883);

    const sample = matches[0];
    expect(sample.match_id).toBeDefined();
    expect(sample.home_team).toBeDefined();
    expect(sample.away_team).toBeDefined();
    expect(sample.result).toBeDefined();
    expect(sample.quality_flags).toBeDefined();
  });

  it('Private Match Replay: verifies ball-by-ball delivery array synchrony and turning points', () => {
    if (!fs.existsSync(privateDir)) {
      // In public build, private dir is omitted by design
      return;
    }

    const samplePath = path.join(privateDir, '13511.json');
    if (!fs.existsSync(samplePath)) {
      return;
    }

    const raw = fs.readFileSync(samplePath, 'utf-8');
    const match = JSON.parse(raw);

    expect(match.match_id).toBe(13511);
    const n = match.innings.length;
    expect(n).toBeGreaterThan(100);

    // Synchronized array lengths
    expect(match.over.length).toBe(n);
    expect(match.ball.length).toBe(n);
    expect(match.striker_id.length).toBe(n);
    expect(match.bowler_id.length).toBe(n);
    expect(match.bat_runs.length).toBe(n);
    expect(match.team_runs.length).toBe(n);
    expect(match.score_before.length).toBe(n);
    expect(match.wkts_before.length).toBe(n);
    expect(match.v_bat.length).toBe(n);
    expect(match.li.length).toBe(n);
    expect(match.pressure_band.length).toBe(n);

    // Probability range
    match.v_bat.forEach((v: number) => {
      expect(v).toBeGreaterThanOrEqual(0.0);
      expect(v).toBeLessThanOrEqual(1.0);
    });

    // Turning points and WPA
    expect(match.summary.top_turning_points.length).toBeGreaterThanOrEqual(1);
    expect(match.summary.player_contributions.length).toBeGreaterThanOrEqual(1);
  });
});
