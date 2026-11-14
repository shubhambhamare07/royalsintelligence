import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CanonicalPlayerRegistry } from '../lib/data/canonical';
import { getTeamBranding } from '../lib/data/teams';

describe('Canonical Player Identity & Ranking Parity', () => {
  // Load actual frozen rankings and players index from public/data
  const rankingsPath = path.resolve(__dirname, '../../public/data/rankings.json');
  const playersPath = path.resolve(__dirname, '../../public/data/players_index.json');

  const rankings = JSON.parse(fs.readFileSync(rankingsPath, 'utf-8'));
  const players = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));

  const registry = CanonicalPlayerRegistry.getInstance();
  registry.initialize(
    players,
    rankings.eligible_batters || rankings.top_10_batters,
    rankings.eligible_bowlers || rankings.top_10_bowlers
  );

  it('preserves exact Top 10 Batters rankings and point ratings', () => {
    const topBatters = rankings.top_10_batters;
    expect(topBatters).toHaveLength(10);

    expect(String(topBatters[0].player_id)).toBe('6931');
    expect(topBatters[0].player_name).toBe('Pathum Nissanka');
    expect(topBatters[0].rating).toBeCloseTo(95.57, 2);

    expect(String(topBatters[1].player_id)).toBe('4260');
    expect(topBatters[1].player_name).toBe('Heinrich Klaasen');
    expect(topBatters[1].rating).toBeCloseTo(94.94, 2);

    expect(String(topBatters[2].player_id)).toBe('1318');
    expect(topBatters[2].player_name).toBe('Andre Russell');
    expect(topBatters[2].rating).toBeCloseTo(83.87, 2);
  });

  it('preserves exact Top 10 Bowlers rankings and point ratings', () => {
    const topBowlers = rankings.top_10_bowlers;
    expect(topBowlers).toHaveLength(10);

    expect(String(topBowlers[0].player_id)).toBe('8661');
    expect(topBowlers[0].player_name).toBe('Matheesha Pathirana');
    expect(topBowlers[0].rating).toBeCloseTo(90.95, 2);

    expect(String(topBowlers[1].player_id)).toBe('4219');
    expect(topBowlers[1].player_name).toBe('Krunal Pandya');
    expect(topBowlers[1].rating).toBeCloseTo(81.61, 2);

    expect(String(topBowlers[2].player_id)).toBe('781');
    expect(topBowlers[2].player_name).toBe('Sunil Narine');
    expect(topBowlers[2].rating).toBeCloseTo(78.48, 2);
  });

  it('resolves canonical player records by ID without ambiguity', () => {
    const nissanka = registry.getPlayerById('6931');
    expect(nissanka).toBeDefined();
    expect(nissanka?.name).toBe('Pathum Nissanka');

    const pathirana = registry.getPlayerById('8661');
    expect(pathirana).toBeDefined();
    expect(pathirana?.name).toBe('Matheesha Pathirana');
  });

  it('resolves authentic IPL team branding and colors', () => {
    const rr = getTeamBranding('Rajasthan Royals');
    expect(rr).toBeDefined();
    expect(rr?.primary_color).toBe('#E6007E');
    expect(rr?.short_name).toBe('RR');

    const csk = getTeamBranding('CSK');
    expect(csk).toBeDefined();
    expect(csk?.primary_color).toBe('#F9CD05');
  });

  it('guarantees qualified count matches 155 batters and 151 bowlers (306 total)', () => {
    expect(rankings.eligible_batters.length).toBe(155);
    expect(rankings.eligible_bowlers.length).toBe(151);
    expect(rankings.eligible_batters.length + rankings.eligible_bowlers.length).toBe(306);
  });
});
