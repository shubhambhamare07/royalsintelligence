export type PlayerRole = 'batter' | 'bowler' | 'all-rounder';
export type PlayerTier = 'Elite' | 'Proven' | 'Promising' | 'Developing' | 'Fringe' | 'Unproven';
export type ProvenanceTag = 'Observed' | 'Calculated' | 'Model estimate' | 'Unavailable';

export interface DescriptiveStats {
  pressure_runs?: number;
  pressure_dismissals?: number;
  pressure_sr?: number;
  pressure_average?: number;
  consistency_hit_rate?: number;
  pressure_balls_bowled?: number;
  pressure_wickets?: number;
  pressure_economy?: number;
  pressure_dot_rate?: number;
  [key: string]: any;
}

export interface RankedPlayer {
  rank: number;
  player_id: string | number;
  player_name: string;
  role: 'batter' | 'bowler';
  tier: PlayerTier;
  rating: number;
  rating_ci90: [number, number];
  p_outperform: number;
  composite: number;
  PV: number;
  PV_scaled: number;
  CD: number;
  CD_scaled: number;
  CD_ci90: [number, number];
  PC: number;
  PC_scaled: number;
  n_pressure_deliveries: number;
  neff_pressure: number;
  n_pressure_matches: number;
  normal_value: number;
  pressure_value: number;
  top10_inclusion_prob: number;
  rank_ci90: [number, number];
  explanation: string;
  descriptive_stats?: DescriptiveStats;
}

export interface RankingsData {
  model_version: string;
  config_hash: string;
  dataset_manifest_hash: string;
  git_commit: string;
  timestamp: string;
  diagnostics_path: string;
  counts: {
    batters_evaluated: number;
    bowlers_evaluated: number;
    eligible_batters: number;
    eligible_bowlers: number;
  };
  top_10_batters: RankedPlayer[];
  top_10_bowlers: RankedPlayer[];
  eligible_batters: RankedPlayer[];
  eligible_bowlers: RankedPlayer[];
}

export interface SummaryData {
  players_analyzed: number;
  matches_count: number;
  deliveries_count: number;
  competitions_count: number;
  seasons_count: number;
}

export interface InsightItem {
  insight_id: string;
  category: string;
  headline: string;
  description: string;
  source_key: string;
  metric_value?: string | number;
  player_id?: string | number;
  player_name?: string;
  target_route?: string;
}

export interface InsightsData {
  model_version: string;
  generated_at: string;
  count: number;
  insights: InsightItem[];
}

export interface PlayerDirectoryItem {
  player_id: number | string;
  name: string;
  display_label: string;
  teams: string[];
  franchise_teams: string[];
  national_teams: string[];
  competitions: string[];
  derived_role: 'BAT' | 'BOWL' | 'ALL' | 'WK' | string;
  batting_hand: 'RHB' | 'LHB' | string | null;
  bowling_type: string | null;
  pace_or_spin: 'Pace' | 'Spin' | string | null;
  matches_played: number;
  balls_faced: number;
  deliveries_bowled: number;
}

export interface PlayerDossier {
  player_id: number | string;
  player_name: string;
  batting?: {
    matches: number;
    innings: number;
    not_outs: number;
    runs: number;
    balls: number;
    average: number;
    strike_rate: number;
    highest_score: number;
    fours: number;
    sixes: number;
    dots: number;
    singles: number;
    twos: number;
    threes: number;
    ducks: number;
    thirties: number;
    fifties: number;
    hundreds: number;
    dismissals_by_type: Record<string, number>;
  };
  bowling?: {
    matches: number;
    innings: number;
    overs: number;
    legal_balls?: number;
    maidens?: number;
    runs?: number;
    runs_charged?: number;
    wickets: number;
    economy: number;
    average: number;
    strike_rate: number;
    dots?: number;
    dot_pct?: number;
    boundary_pct?: number;
    fours?: number;
    sixes?: number;
    wides?: number;
    no_balls?: number;
    four_wickets?: number;
    five_wickets?: number;
    phase_splits?: {
      powerplay?: { overs: number; runs: number; wickets: number; economy: number };
      middle?: { overs: number; runs: number; wickets: number; economy: number };
      death?: { overs: number; runs: number; wickets: number; economy: number };
    };
  };
  rated_batting?: {
    rating: number;
    tier: PlayerTier;
    p_outperform: number;
    pressure_value_per_100: number;
    clutch_delta_per_100: number;
    consistency: number;
  } | null;
  rated_bowling?: {
    rating: number;
    tier: PlayerTier;
    p_outperform: number;
    pressure_value_per_100: number;
    clutch_delta_per_100: number;
    consistency: number;
  } | null;
  recent_matches?: Array<{
    match_id: number;
    date: string;
    competition: string;
    year: number;
    batting_figures: string | null;
    bowling_figures: string | null;
    pressure_balls: number;
    pressure_value: number;
  }>;
  anomalies?: Array<{
    player_id: number;
    player_name: string;
    role: string;
    match_id: number;
    n_balls: number;
    match_runs: number;
    match_pressure_value: number;
    career_expected_value: number;
    z_score: number;
    direction: 'positive' | 'negative';
  }>;
}

export interface PlayerCertificate {
  certificate_id?: string;
  generated_at?: string;
  player_id?: string | number;
  player_name?: string;
  role?: string;
  tier?: string;
  rating?: any; // can be number or { point_estimate: number; ci_90: [number, number]; percentile_in_role: number }
  rating_ci90?: [number, number];
  p_outperform?: number;
  top10_inclusion_prob?: number;
  rank_ci90?: [number, number];
  composite?: number;
  player?: {
    player_id: number | string;
    player_name: string;
    role: string;
    tier: string;
    franchise_teams?: string[];
  };
  components?: {
    PV?: {
      observed: number;
      adjusted: number;
      z_score: number;
      shrinkage_factor: number;
      weight: number;
    };
    CD?: {
      observed: number;
      adjusted: number;
      z_score: number;
      ci90?: [number, number];
      orthogonalized?: boolean;
      weight: number;
    };
    PC?: {
      observed: number;
      adjusted: number;
      z_score: number;
      k_units?: number;
      h_hits?: number;
      weight: number;
    };
    pressure_value?: {
      raw_per_100: number;
      scaled_z: number;
      description: string;
    };
    clutch_delta?: {
      raw_per_100: number;
      scaled_z: number;
      ci_90: [number, number];
      description: string;
    };
    pressure_consistency?: {
      raw_hit_rate: number;
      scaled_z: number;
      description: string;
    };
  };
  exposure?: {
    pressure_deliveries?: number;
    n_pressure_deliveries?: number;
    neff_pressure?: number;
    pressure_matches?: number;
    n_pressure_matches?: number;
    n_normal_deliveries?: number;
    neff_normal?: number;
    n_total_matches?: number;
  };
  explanation?: string;
  verification_hash?: string;
  status?: string;
}

export interface TeamBranding {
  team_id: number;
  team_name: string;
  short_name: string;
  logo_path: string;
  primary_color: string;
  secondary_color: string;
  asset_source: string;
  verification_status: string;
}

export interface PlayerImageRecord {
  player_id: number | string;
  player_name: string;
  role: string;
  team: string;
  asset_path: string;
  asset_type: 'official' | 'licensed' | 'generated_illustration' | 'initials_fallback';
  source: string;
  verification_status: 'verified' | 'unverified';
  attribution?: string;
}

// ==========================================
// PHASE 07B: ADVANCED ANALYTICS & RESEARCH TYPES
// ==========================================

export interface SensitivitySummary {
  n_simulations: number;
  mean_bat_top10_overlap: number;
  mean_bowl_top10_overlap: number;
  primary_top10_batters_inclusion_freq: Record<string, number>;
  primary_top10_bowlers_inclusion_freq: Record<string, number>;
  fragile_picks_batters: string[];
  fragile_picks_bowlers: string[];
}

export interface TransferabilityPoint {
  player_id: number | string;
  player_name: string;
  ipl_exposure: number;
  t20i_exposure: number;
  ipl_value: number;
  ipl_ci90: [number, number];
  t20i_value: number;
  t20i_ci90: [number, number];
}

export interface TransferabilityDomain {
  n_qualified: number;
  limited_evidence: boolean;
  min_deliveries_threshold: number;
  spearman_rho: number;
  p_value: number;
  ci95: [number, number];
  reliability_ipl: number;
  reliability_t20i: number;
  rho_disattenuated: number;
  scatter_points: TransferabilityPoint[];
}

export interface TransferabilityData {
  model_version: string;
  disclaimer: string;
  notes: string;
  batter_transferability: TransferabilityDomain;
  bowler_transferability: TransferabilityDomain;
}

export interface HiddenGemsThresholds {
  min_p_outperform: number;
  batter_median_balls: number;
  batter_median_sr: number;
  bowler_median_balls: number;
  bowler_median_econ: number;
}

export interface GemPlayer {
  player_id: number | string;
  player_name: string;
  role: 'batter' | 'bowler';
  tier: PlayerTier;
  rating: number;
  rating_ci90: [number, number];
  p_outperform: number;
  exposure_balls: number;
  exposure_percentile: number;
  sr_or_econ: number;
  sr_or_econ_label: string;
  sr_or_econ_percentile: number;
  low_exposure_flag: boolean;
  low_rate_flag: boolean;
  reason_string: string;
}

export interface HiddenGemsData {
  model_version: string;
  thresholds: HiddenGemsThresholds;
  counts: {
    gem_batters: number;
    gem_bowlers: number;
    total_gems: number;
  };
  gem_batters: GemPlayer[];
  gem_bowlers: GemPlayer[];
}

export interface MatchQualityFlags {
  is_dls?: boolean;
  dls?: boolean;
  is_tie?: boolean;
  is_no_result?: boolean;
  is_abandoned?: boolean;
  has_deliveries?: boolean;
  is_incomplete?: boolean;
  incomplete_innings?: boolean;
  low_confidence_totals?: boolean;
  target_reconstructed?: boolean;
  t1_sigma?: number;
}

export interface MatchIndexItem {
  match_id: number;
  match_date: string;
  comp_id: number;
  comp_name: string;
  kind: 'IPL' | 'T20I' | string;
  season: string;
  year: number;
  stage: string;
  home_team: string;
  away_team: string;
  result: string;
  winner_team: string;
  winner_team_id: number;
  quality_flags: MatchQualityFlags;
  reconstructed_totals?: {
    inn1_total: number;
    inn2_total: number;
    target: number;
    t1_star: number;
    t1_sigma: number;
    residual: number;
  };
}

export interface MatchSummaryData {
  match_id: number;
  competition_kind: string;
  calendar_year: number;
  result: string;
  innings_totals: Record<string, number>;
  quality_flags: MatchQualityFlags;
  over_pressure_band_counts: Record<string, Record<string, number>>;
  turning_point_count: number;
}

export interface TurningPoint {
  innings: number;
  over: number;
  ball: number;
  striker_id: number;
  bowler_id: number;
  delta_v: number;
  score_before: number;
  wkts_before: number;
  pressure_band: string;
}

export interface PlayerContribution {
  player_id: number;
  net_wpa: number;
}

export interface PrivateMatchReplay {
  match_id: number;
  innings: number[];
  over: number[];
  ball: number[];
  striker_id: number[];
  bowler_id: number[];
  bat_runs: number[];
  team_runs: number[];
  is_wicket: boolean[];
  credited_wicket: boolean[];
  score_before: number[];
  wkts_before: number[];
  target: number[];
  rrr: (number | null)[];
  v_bat: number[];
  li: number[];
  pressure_band: string[];
  summary: {
    innings_totals: Record<string, number>;
    quality_flags: MatchQualityFlags;
    top_turning_points: TurningPoint[];
    player_contributions: PlayerContribution[];
  };
}


