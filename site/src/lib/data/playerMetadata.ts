/**
 * Central authoritative player metadata, franchise trade, and nationality resolver
 */

import { getTeamBranding } from './teams';

// Explicit verified trade and top-20 franchise assignments
export const VERIFIED_FRANCHISE_MAP: Record<number, { name: string; short: string }> = {
  // Top 10 Batters
  6931: { name: 'Delhi Capitals', short: 'DC' }, // Trade to DC
  4260: { name: 'Sunrisers Hyderabad', short: 'SRH' },
  1318: { name: 'Kolkata Knight Riders', short: 'KKR' },
  2756: { name: 'Punjab Kings', short: 'PBKS' },
  143: { name: 'Royal Challengers Bengaluru', short: 'RCB' },
  3672: { name: 'Gujarat Titans', short: 'GT' },
  3916: { name: 'Punjab Kings', short: 'PBKS' },
  4722: { name: 'Gujarat Titans', short: 'GT' },
  1699: { name: 'Mumbai Indians', short: 'MI' },
  4106: { name: 'Chennai Super Kings', short: 'CSK' },

  // Top 10 Bowlers
  8661: { name: 'Kolkata Knight Riders', short: 'KKR' }, // Trade to KKR
  4219: { name: 'Lucknow Super Giants', short: 'LSG' },
  781: { name: 'Kolkata Knight Riders', short: 'KKR' },
  830: { name: 'Royal Challengers Bengaluru', short: 'RCB' },
  2876: { name: 'Delhi Capitals', short: 'DC' },
  3644: { name: 'Delhi Capitals', short: 'DC' },
  360: { name: 'Royal Challengers Bengaluru', short: 'RCB' }, // Verified RCB assignment
  1758: { name: 'Sunrisers Hyderabad', short: 'SRH' },
  7920: { name: 'Chennai Super Kings', short: 'CSK' }, // Verified CSK assignment
  7327: { name: 'Delhi Capitals', short: 'DC' },
};

// Canonical nationality mapping for Top 20 and certified qualified players
export const VERIFIED_NATIONALITY_MAP: Record<number, string> = {
  6931: 'Sri Lanka',
  4260: 'South Africa',
  1318: 'West Indies',
  2756: 'India',
  143: 'India',
  3672: 'Sri Lanka',
  3916: 'India',
  4722: 'Afghanistan',
  1699: 'India',
  4106: 'New Zealand',
  8661: 'Sri Lanka',
  4219: 'India',
  781: 'West Indies',
  830: 'Australia',
  2876: 'India',
  3644: 'India',
  360: 'India',
  1758: 'Australia',
  7920: 'Australia',
  7327: 'India',

  // All domestic/international qualified players without T20I matches in sample window
  8: 'India', // MS Dhoni
  28: 'India', // Ishant Sharma
  88: 'South Africa', // Faf du Plessis
  109: 'India', // Wriddhiman Saha
  142: 'India', // Shikhar Dhawan
  167: 'India', // Ajinkya Rahane
  198: 'India', // Manish Pandey
  992: 'India', // Mayank Agarwal
  1071: 'India', // Jaydev Unadkat
  2411: 'India', // Sandeep Sharma
  2877: 'India', // Vijay Shankar
  2878: 'India', // Mohit Sharma
  3782: 'India', // M Shahrukh Khan
  3926: 'India', // Rahul Tewatia
  4246: 'India', // Nitish Rana
  4265: 'India', // T Natarajan
  4494: 'India', // Abhinav Manohar
  5039: 'India', // Rajat Patidar
  5577: 'India', // Sai Kishore
  6161: 'India', // Rahul Chahar
  6314: 'India', // Devdutt Padikkal
  6460: 'India', // Ayush Badoni
  6467: 'India', // Anuj Rawat
  6669: 'India', // Mohsin Khan
  7059: 'India', // Nehal Wadhera
  7250: 'India', // Mukesh Choudhary
  7325: 'India', // Harpreet Brar
  7446: 'India', // Abdul Samad
  7545: 'India', // Kuldeep Sen
  8101: 'India', // Ashutosh Sharma
  8238: 'India', // Sameer Rizvi
  8530: 'India', // Kartik Tyagi
  8746: 'India', // Vaibhav Arora
  19714: 'India', // Abishek Porel
  25669: 'India', // Priyansh Arya
  27964: 'India', // Anshul Kamboj
  36982: 'India', // Suyash Sharma
  58134: 'India', // Digvesh Rathi
  67036: 'India', // Brijesh Sharma
};

// Country name to SVG flag mapping
export const COUNTRY_FLAG_MAP: Record<string, string> = {
  'sri lanka': '/assets/flags/lk.svg',
  'india': '/assets/flags/in.svg',
  'south africa': '/assets/flags/za.svg',
  'west indies': '/assets/flags/wi.svg',
  'australia': '/assets/flags/au.svg',
  'afghanistan': '/assets/flags/af.svg',
  'new zealand': '/assets/flags/nz.svg',
  'england': '/assets/flags/eng.svg',
  'bangladesh': '/assets/flags/bd.svg',
  'pakistan': '/assets/flags/pk.svg',
  'ireland': '/assets/flags/ie.svg',
  'zimbabwe': '/assets/flags/zw.svg',
  'netherlands': '/assets/flags/nl.svg',
  'scotland': '/assets/flags/sco.svg',
  'united arab emirates': '/assets/flags/ae.svg',
  'uae': '/assets/flags/ae.svg',
  'united states of america': '/assets/flags/us.svg',
  'usa': '/assets/flags/us.svg',
  'canada': '/assets/flags/ca.svg',
  'nepal': '/assets/flags/np.svg',
  'oman': '/assets/flags/om.svg',
  'hong kong': '/assets/flags/hk.svg',
  'kuwait': '/assets/flags/kw.svg',
  'singapore': '/assets/flags/sg.svg',
  'japan': '/assets/flags/jp.svg',
};

/**
 * Returns the country flag SVG path for a given country name
 */
export function getCountryFlag(countryName?: string | null): string | null {
  if (!countryName) return null;
  const key = countryName.trim().toLowerCase();
  return COUNTRY_FLAG_MAP[key] || null;
}

/**
 * Resolves verified IPL franchise branding for a player ID with fallback
 */
export function getPlayerFranchise(
  playerId: string | number | undefined,
  fallbackTeams?: string[]
): { name: string; short: string; logo: string } | null {
  if (!playerId) return null;
  const idNum = typeof playerId === 'number' ? playerId : parseInt(String(playerId), 10);
  
  // 1. Check verified trade map
  if (!isNaN(idNum) && VERIFIED_FRANCHISE_MAP[idNum]) {
    const verified = VERIFIED_FRANCHISE_MAP[idNum];
    const branding = getTeamBranding(verified.short) || getTeamBranding(verified.name);
    return {
      name: verified.name,
      short: verified.short,
      logo: branding ? branding.logo_path : `/assets/teams/user_logos/${verified.short.toLowerCase()}.png`,
    };
  }

  // 2. Check fallback franchises with authentic IPL branding lookup
  if (fallbackTeams && fallbackTeams.length > 0) {
    for (const team of fallbackTeams) {
      const branding = getTeamBranding(team);
      if (branding) {
        return {
          name: branding.team_name,
          short: branding.short_name,
          logo: branding.logo_path,
        };
      }
    }
  }

  return null;
}

/**
 * Resolves verified nationality for a player ID with fallback
 */
export function getPlayerNationality(
  playerId: string | number | undefined,
  fallbackNationalTeams?: string[]
): string {
  if (!playerId) return 'Unknown';
  const idNum = typeof playerId === 'number' ? playerId : parseInt(String(playerId), 10);
  if (!isNaN(idNum) && VERIFIED_NATIONALITY_MAP[idNum]) {
    return VERIFIED_NATIONALITY_MAP[idNum];
  }
  if (fallbackNationalTeams && fallbackNationalTeams.length > 0) {
    return fallbackNationalTeams[0];
  }
  return 'International';
}

