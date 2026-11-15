import { describe, it, expect } from 'vitest';
import { TOP_PLAYER_IMAGES, getPlayerImageUrl } from '../lib/data/playerImages';
import {
  getPlayerFranchise,
  getPlayerNationality,
  getCountryFlag,
  VERIFIED_FRANCHISE_MAP,
  VERIFIED_NATIONALITY_MAP,
} from '../lib/data/playerMetadata';
import { IPL_TEAMS, getTeamBranding } from '../lib/data/teams';
import { generatePlayerInsights } from '../lib/data/playerInsights';

describe('Universal Player Profile & Identity Integrity', () => {
  it('correctly maps verified local photographs for Top 20 players without duplicates', () => {
    const keys = Object.keys(TOP_PLAYER_IMAGES).map(Number);
    expect(keys.length).toBe(20);

    // Verify Pathum Nissanka photo
    expect(getPlayerImageUrl(6931)).toBe('/assets/players/top10/pathum-nissanka.webp');
    // Verify Heinrich Klaasen photo
    expect(getPlayerImageUrl(4260)).toBe('/assets/players/top10/heinrich-klaasen.webp');
    // Verify Matheesha Pathirana photo
    expect(getPlayerImageUrl(8661)).toBe('/assets/players/top10/matheesha-pathirana.webp');
    // Verify Nathan Ellis photo
    expect(getPlayerImageUrl(7920)).toBe('/assets/players/top10/nathan-ellis.png');

    // Verify unmapped player returns null
    expect(getPlayerImageUrl(999999)).toBeNull();
  });

  it('enforces verified franchise assignments for Nissanka, Pathirana, Bhuvneshwar, and Ellis', () => {
    // 1. Pathum Nissanka -> DC (Delhi Capitals)
    const nissankaFranchise = getPlayerFranchise(6931);
    expect(nissankaFranchise).not.toBeNull();
    expect(nissankaFranchise?.short).toBe('DC');
    expect(nissankaFranchise?.name).toBe('Delhi Capitals');
    expect(nissankaFranchise?.logo).toBe('/assets/teams/user_logos/dc.png');

    // 2. Matheesha Pathirana -> KKR (Kolkata Knight Riders)
    const pathiranaFranchise = getPlayerFranchise(8661);
    expect(pathiranaFranchise).not.toBeNull();
    expect(pathiranaFranchise?.short).toBe('KKR');
    expect(pathiranaFranchise?.name).toBe('Kolkata Knight Riders');
    expect(pathiranaFranchise?.logo).toBe('/assets/teams/user_logos/kkr.png');

    // 3. Bhuvneshwar Kumar -> RCB (Royal Challengers Bengaluru)
    const bhuviFranchise = getPlayerFranchise(360);
    expect(bhuviFranchise).not.toBeNull();
    expect(bhuviFranchise?.short).toBe('RCB');
    expect(bhuviFranchise?.name).toBe('Royal Challengers Bengaluru');
    expect(bhuviFranchise?.logo).toBe('/assets/teams/user_logos/rcb.png');

    // 4. Nathan Ellis -> CSK (Chennai Super Kings)
    const ellisFranchise = getPlayerFranchise(7920);
    expect(ellisFranchise).not.toBeNull();
    expect(ellisFranchise?.short).toBe('CSK');
    expect(ellisFranchise?.name).toBe('Chennai Super Kings');
    expect(ellisFranchise?.logo).toBe('/assets/teams/user_logos/csk.png');
  });

  it('correctly resolves official IPL team logos from user_logos directory', () => {
    const teams = ['CSK', 'DC', 'GT', 'KKR', 'LSG', 'MI', 'PBKS', 'RCB', 'RR', 'SRH'];
    for (const code of teams) {
      const branding = getTeamBranding(code);
      expect(branding).toBeDefined();
      expect(branding?.logo_path).toBe(`/assets/teams/user_logos/${code.toLowerCase()}.png`);
    }
  });

  it('correctly resolves verified national flags for player countries', () => {
    expect(getCountryFlag('Sri Lanka')).toBe('/assets/flags/lk.svg');
    expect(getCountryFlag('India')).toBe('/assets/flags/in.svg');
    expect(getCountryFlag('South Africa')).toBe('/assets/flags/za.svg');
    expect(getCountryFlag('West Indies')).toBe('/assets/flags/wi.svg');
    expect(getCountryFlag('Australia')).toBe('/assets/flags/au.svg');
    expect(getCountryFlag('Afghanistan')).toBe('/assets/flags/af.svg');
    expect(getCountryFlag('New Zealand')).toBe('/assets/flags/nz.svg');
    expect(getCountryFlag('England')).toBe('/assets/flags/eng.svg');
  });

  it('ensures no cross-player data leakage between distinct player profiles', () => {
    const nissankaInsights = generatePlayerInsights({
      playerId: 6931,
      playerName: 'Pathum Nissanka',
      role: 'batter',
      dossier: {
        batting: { innings: 71, runs: 2084, balls: 1528, fours: 218, sixes: 69, dots: 579 },
        bowling: null,
      },
      cert: { components: { PV: { shrinkage_factor: 0.7609 } } },
      rank: { PV: 0.2672, CD: 0.2699, PC: 0.6783, n_pressure_deliveries: 470, normal_value: -0.0026 },
    });

    const pathiranaInsights = generatePlayerInsights({
      playerId: 8661,
      playerName: 'Matheesha Pathirana',
      role: 'bowler',
      dossier: {
        batting: null,
        bowling: {
          overs: 175.2,
          legal_balls: 1051,
          runs: 1503,
          wickets: 76,
          economy: 8.58,
          dot_pct: 32.94,
          phase_splits: {
            death: { overs: 85.8, runs: 772, wickets: 48, economy: 8.99 },
          },
        },
      },
      cert: { components: { PV: { shrinkage_factor: 0.6834 } } },
      rank: { PV: 0.0641, CD: -0.0823, PC: 0.564, n_pressure_deliveries: 260, normal_value: 0.1464 },
    });

    // Nissanka must have batting insights and NO bowling insights
    expect(nissankaInsights.some((i) => i.id === 'bat-boundary')).toBe(true);
    expect(nissankaInsights.some((i) => i.id.startsWith('bowl-'))).toBe(false);

    // Pathirana must have bowling death specialist insight and NO batting insights
    expect(pathiranaInsights.some((i) => i.id === 'bowl-death-specialist')).toBe(true);
    expect(pathiranaInsights.some((i) => i.id === 'bat-boundary')).toBe(false);

    // Both must have distinct PV numbers
    const nissankaPV = nissankaInsights.find((i) => i.id === 'pv-positive')?.metricValue;
    const pathiranaPV = pathiranaInsights.find((i) => i.id === 'pv-positive')?.metricValue;
    expect(nissankaPV).toBe('+26.72 /100b');
    expect(pathiranaPV).toBe('+6.41 /100b');
  });
});

