import { TeamBranding } from './types';

export const IPL_TEAMS: Record<string, TeamBranding> = {
  'Rajasthan Royals': {
    team_id: 3,
    team_name: 'Rajasthan Royals',
    short_name: 'RR',
    logo_path: '/assets/teams/user_logos/rr.png',
    primary_color: '#E6007E',
    secondary_color: '#14213D',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Chennai Super Kings': {
    team_id: 1,
    team_name: 'Chennai Super Kings',
    short_name: 'CSK',
    logo_path: '/assets/teams/user_logos/csk.png',
    primary_color: '#F9CD05',
    secondary_color: '#005FAC',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Mumbai Indians': {
    team_id: 2,
    team_name: 'Mumbai Indians',
    short_name: 'MI',
    logo_path: '/assets/teams/user_logos/mi.png',
    primary_color: '#004BA0',
    secondary_color: '#D1AB3E',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Royal Challengers Bengaluru': {
    team_id: 5,
    team_name: 'Royal Challengers Bengaluru',
    short_name: 'RCB',
    logo_path: '/assets/teams/user_logos/rcb.png',
    primary_color: '#EC1C24',
    secondary_color: '#000000',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Kolkata Knight Riders': {
    team_id: 8,
    team_name: 'Kolkata Knight Riders',
    short_name: 'KKR',
    logo_path: '/assets/teams/user_logos/kkr.png',
    primary_color: '#3A225D',
    secondary_color: '#F7D54E',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Delhi Capitals': {
    team_id: 7,
    team_name: 'Delhi Capitals',
    short_name: 'DC',
    logo_path: '/assets/teams/user_logos/dc.png',
    primary_color: '#004C97',
    secondary_color: '#DC042B',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Sunrisers Hyderabad': {
    team_id: 242,
    team_name: 'Sunrisers Hyderabad',
    short_name: 'SRH',
    logo_path: '/assets/teams/user_logos/srh.png',
    primary_color: '#F26522',
    secondary_color: '#111111',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Gujarat Titans': {
    team_id: 3508,
    team_name: 'Gujarat Titans',
    short_name: 'GT',
    logo_path: '/assets/teams/user_logos/gt.png',
    primary_color: '#1B2133',
    secondary_color: '#BE9B5E',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Lucknow Super Giants': {
    team_id: 3509,
    team_name: 'Lucknow Super Giants',
    short_name: 'LSG',
    logo_path: '/assets/teams/user_logos/lsg.png',
    primary_color: '#0057E7',
    secondary_color: '#FA4D00',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
  'Punjab Kings': {
    team_id: 4,
    team_name: 'Punjab Kings',
    short_name: 'PBKS',
    logo_path: '/assets/teams/user_logos/pbks.png',
    primary_color: '#DD1F2D',
    secondary_color: '#DDA032',
    asset_source: 'Verified Authentic IPL Heraldry',
    verification_status: 'Verified',
  },
};

export function getTeamBranding(teamNameOrShort: string | undefined): TeamBranding | undefined {
  if (!teamNameOrShort) return undefined;
  if (IPL_TEAMS[teamNameOrShort]) return IPL_TEAMS[teamNameOrShort];

  const lower = teamNameOrShort.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (t.team_name.toLowerCase() === lower || t.short_name.toLowerCase() === lower) {
      return t;
    }
  }
  return undefined;
}

