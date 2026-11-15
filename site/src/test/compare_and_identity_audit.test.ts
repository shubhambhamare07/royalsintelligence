import { describe, it, expect } from 'vitest';
import { getPlayerFranchise, getPlayerNationality, getCountryFlag, VERIFIED_FRANCHISE_MAP, VERIFIED_NATIONALITY_MAP } from '../lib/data/playerMetadata';
import { getPlayerImageUrl, TOP_PLAYER_IMAGES } from '../lib/data/playerImages';
import { getTeamBranding } from '../lib/data/teams';

describe('Player Identity & Franchise Mapping Forensic Audit', () => {
  it('correctly maps Bhuvneshwar Kumar (ID 360) to RCB with authentic RCB logo', () => {
    const franchise = getPlayerFranchise(360);
    expect(franchise).not.toBeNull();
    expect(franchise?.short).toBe('RCB');
    expect(franchise?.name).toBe('Royal Challengers Bengaluru');
    expect(franchise?.logo).toBe('/assets/teams/user_logos/rcb.png');

    const nationality = getPlayerNationality(360);
    expect(nationality).toBe('India');
    expect(getCountryFlag(nationality)).toBe('/assets/flags/in.svg');
    expect(getPlayerImageUrl(360)).toBe('/assets/players/top10/bhuvneshwar-kumar.webp');
  });

  it('correctly maps Nathan Ellis (ID 7920) to CSK with authentic CSK logo', () => {
    const franchise = getPlayerFranchise(7920);
    expect(franchise).not.toBeNull();
    expect(franchise?.short).toBe('CSK');
    expect(franchise?.name).toBe('Chennai Super Kings');
    expect(franchise?.logo).toBe('/assets/teams/user_logos/csk.png');

    const nationality = getPlayerNationality(7920);
    expect(nationality).toBe('Australia');
    expect(getCountryFlag(nationality)).toBe('/assets/flags/au.svg');
    expect(getPlayerImageUrl(7920)).toBe('/assets/players/top10/nathan-ellis.png');
  });

  it('correctly resolves verified domestic player nationalities without "International" fallback', () => {
    expect(getPlayerNationality(2756)).toBe('India'); // Shashank Singh
    expect(getPlayerNationality(8)).toBe('India'); // MS Dhoni
    expect(getPlayerNationality(88)).toBe('South Africa'); // Faf du Plessis
    expect(getPlayerNationality(781)).toBe('West Indies'); // Sunil Narine
    expect(getPlayerNationality(4219)).toBe('India'); // Krunal Pandya
    expect(getPlayerNationality(7327)).toBe('India'); // Rasikh Salam
  });

  it('never outputs missing logos or fake acronyms for non-IPL fallback teams', () => {
    // A player with only national or non-IPL teams must return null instead of a 404 path
    const fallbackTest = getPlayerFranchise(99999, ['India A', 'England']);
    expect(fallbackTest).toBeNull();
  });

  it('accurately resolves official IPL logos for all 10 franchises', () => {
    const franchises = [
      { code: 'RR', name: 'Rajasthan Royals' },
      { code: 'CSK', name: 'Chennai Super Kings' },
      { code: 'MI', name: 'Mumbai Indians' },
      { code: 'RCB', name: 'Royal Challengers Bengaluru' },
      { code: 'KKR', name: 'Kolkata Knight Riders' },
      { code: 'DC', name: 'Delhi Capitals' },
      { code: 'SRH', name: 'Sunrisers Hyderabad' },
      { code: 'GT', name: 'Gujarat Titans' },
      { code: 'LSG', name: 'Lucknow Super Giants' },
      { code: 'PBKS', name: 'Punjab Kings' },
    ];

    for (const f of franchises) {
      const branding = getTeamBranding(f.code);
      expect(branding).toBeDefined();
      expect(branding?.short_name).toBe(f.code);
      expect(branding?.team_name).toBe(f.name);
      expect(branding?.logo_path).toBe(`/assets/teams/user_logos/${f.code.toLowerCase()}.png`);
    }
  });

  it('has verified local photograph assets for all 20 Top 10 players', () => {
    expect(Object.keys(TOP_PLAYER_IMAGES).length).toBe(20);
    for (const [id, path] of Object.entries(TOP_PLAYER_IMAGES)) {
      expect(path).toMatch(/^\/assets\/players\/top10\/[a-z0-9-]+\.(webp|png)$/);
      expect(getPlayerImageUrl(id)).toBe(path);
    }
  });
});
