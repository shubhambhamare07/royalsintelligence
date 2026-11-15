import {
  RankingsData,
  SummaryData,
  InsightsData,
  PlayerDirectoryItem,
  PlayerDossier,
  PlayerCertificate,
  TeamBranding,
  PlayerImageRecord,
  SensitivitySummary,
  TransferabilityData,
  HiddenGemsData,
  MatchIndexItem,
  MatchSummaryData,
  PrivateMatchReplay,
} from './types';
import { canonicalRegistry } from './canonical';

class DataLoader {
  private cache = new Map<string, any>();

  public getCached<T>(url: string): T | undefined {
    return this.cache.get(url);
  }

  public getCachedRankings(): RankingsData | undefined {
    return this.cache.get('/data/rankings.json');
  }

  public getCachedDirectory(): PlayerDirectoryItem[] | undefined {
    return this.cache.get('/data/players_index.json');
  }

  public getCachedDna(): any | undefined {
    return this.cache.get('/data/dna.json');
  }

  private async fetchJson<T>(url: string): Promise<T> {
    if (this.cache.has(url)) {
      return this.cache.get(url) as T;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as T;
    this.cache.set(url, data);
    return data;
  }

  public async getRankings(): Promise<RankingsData> {
    const data = await this.fetchJson<RankingsData>('/data/rankings.json');
    return data;
  }

  public async getSummary(): Promise<SummaryData> {
    return this.fetchJson<SummaryData>('/data/summary.json');
  }

  public async getInsights(): Promise<InsightsData> {
    return this.fetchJson<InsightsData>('/data/insights.json');
  }

  public async getPlayersIndex(): Promise<PlayerDirectoryItem[]> {
    const players = await this.fetchJson<PlayerDirectoryItem[]>('/data/players_index.json');
    return players;
  }

  public async initializeApp(): Promise<{ rankings: RankingsData; directory: PlayerDirectoryItem[] }> {
    const [rankings, directory] = await Promise.all([
      this.getRankings(),
      this.getPlayersIndex(),
    ]);
    canonicalRegistry.initialize(
      directory,
      rankings.eligible_batters || rankings.top_10_batters,
      rankings.eligible_bowlers || rankings.top_10_bowlers
    );
    return { rankings, directory };
  }

  public async getPlayerDossier(playerId: string | number): Promise<PlayerDossier | null> {
    try {
      return await this.fetchJson<PlayerDossier>(`/data/players/${playerId}.json`);
    } catch {
      return null;
    }
  }

  public async getPlayerCertificate(playerId: string | number, role: 'batter' | 'bowler' = 'batter'): Promise<PlayerCertificate | null> {
    try {
      // Certificates in site_data are stored under certificates/{id}/{role}.json
      return await this.fetchJson<PlayerCertificate>(`/data/certificates/${playerId}/${role}.json`);
    } catch {
      // Try alternate role if first role not found
      try {
        const altRole = role === 'batter' ? 'bowler' : 'batter';
        return await this.fetchJson<PlayerCertificate>(`/data/certificates/${playerId}/${altRole}.json`);
      } catch {
        return null;
      }
    }
  }

  public async getDnaData(): Promise<any> {
    return this.fetchJson<any>('/data/dna.json');
  }

  public async getTeamsManifest(): Promise<TeamBranding[]> {
    try {
      return await this.fetchJson<TeamBranding[]>('/assets/teams/teams-manifest.json');
    } catch {
      return [];
    }
  }

  public async getPlayerImageManifest(): Promise<Record<string, PlayerImageRecord>> {
    try {
      const manifestList = await this.fetchJson<PlayerImageRecord[]>('/assets/players/player-image-manifest.json');
      const map: Record<string, PlayerImageRecord> = {};
      for (const item of manifestList) {
        map[String(item.player_id)] = item;
      }
      return map;
    } catch {
      return {};
    }
  }

  // Phase 07B: Advanced Analytics Loaders
  public async getSensitivitySummary(): Promise<SensitivitySummary> {
    return this.fetchJson<SensitivitySummary>('/data/sensitivity/summary.json');
  }

  public async getMethodologyData(): Promise<any> {
    return this.fetchJson<any>('/data/methodology.json');
  }

  public async getTransferabilityData(): Promise<TransferabilityData> {
    return this.fetchJson<TransferabilityData>('/data/transferability.json');
  }

  public async getHiddenGemsData(): Promise<HiddenGemsData> {
    return this.fetchJson<HiddenGemsData>('/data/hidden_gems.json');
  }

  public async getMatchesIndex(): Promise<MatchIndexItem[]> {
    return this.fetchJson<MatchIndexItem[]>('/data/matches_index.json');
  }

  public async getMatchSummary(matchId: number | string): Promise<MatchSummaryData | null> {
    try {
      return await this.fetchJson<MatchSummaryData>(`/data/matches_summary/${matchId}.json`);
    } catch {
      return null;
    }
  }

  public async getPrivateMatchReplay(matchId: number | string): Promise<PrivateMatchReplay | null> {
    try {
      return await this.fetchJson<PrivateMatchReplay>(`/data/private/matches/${matchId}.json`);
    } catch {
      return null;
    }
  }

  // Phase 07C: Simulator, Validation, and Anomaly Loaders
  public async getSimulatorParams(): Promise<any> {
    return this.fetchJson<any>('/data/simulator/params.json');
  }

  public async getGoldenCases(): Promise<any[]> {
    return this.fetchJson<any[]>('/data/simulator/golden_cases.json');
  }

  public async getAnomalies(): Promise<any> {
    return this.fetchJson<any>('/data/anomalies.json');
  }

  public async getValidationWp(): Promise<any> {
    return this.fetchJson<any>('/data/validation_wp.json');
  }

  public async getValidationSimulator(): Promise<any> {
    return this.fetchJson<any>('/data/validation_simulator.json');
  }

  public async getValidationExpected(): Promise<any> {
    return this.fetchJson<any>('/data/validation_expected.json');
  }
}

export const dataLoader = new DataLoader();

