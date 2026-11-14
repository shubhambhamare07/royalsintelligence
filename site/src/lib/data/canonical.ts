import { PlayerDirectoryItem, RankedPlayer } from './types';

export class CanonicalPlayerRegistry {
  private static instance: CanonicalPlayerRegistry;
  private directoryMap: Map<string, PlayerDirectoryItem> = new Map();
  private batterRankingMap: Map<string, RankedPlayer> = new Map();
  private bowlerRankingMap: Map<string, RankedPlayer> = new Map();
  private nameToIdMap: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): CanonicalPlayerRegistry {
    if (!CanonicalPlayerRegistry.instance) {
      CanonicalPlayerRegistry.instance = new CanonicalPlayerRegistry();
    }
    return CanonicalPlayerRegistry.instance;
  }

  public initialize(
    directory: PlayerDirectoryItem[],
    batters: RankedPlayer[],
    bowlers: RankedPlayer[]
  ): void {
    this.directoryMap.clear();
    this.batterRankingMap.clear();
    this.bowlerRankingMap.clear();
    this.nameToIdMap.clear();

    for (const player of directory) {
      const id = String(player.player_id);
      this.directoryMap.set(id, player);
      this.nameToIdMap.set(player.name.toLowerCase().trim(), id);
    }

    for (const b of batters) {
      const id = String(b.player_id);
      this.batterRankingMap.set(id, b);
      if (!this.nameToIdMap.has(b.player_name.toLowerCase().trim())) {
        this.nameToIdMap.set(b.player_name.toLowerCase().trim(), id);
      }
    }

    for (const b of bowlers) {
      const id = String(b.player_id);
      this.bowlerRankingMap.set(id, b);
      if (!this.nameToIdMap.has(b.player_name.toLowerCase().trim())) {
        this.nameToIdMap.set(b.player_name.toLowerCase().trim(), id);
      }
    }
  }

  public getPlayerById(playerId: string | number): PlayerDirectoryItem | undefined {
    return this.directoryMap.get(String(playerId));
  }

  public getCanonicalName(playerId: string | number, fallback?: string): string {
    const p = this.directoryMap.get(String(playerId));
    if (p) return p.name;
    const b = this.batterRankingMap.get(String(playerId));
    if (b) return b.player_name;
    const bowl = this.bowlerRankingMap.get(String(playerId));
    if (bowl) return bowl.player_name;
    return fallback || `Player ${playerId}`;
  }

  public getBattingRank(playerId: string | number): RankedPlayer | undefined {
    return this.batterRankingMap.get(String(playerId));
  }

  public getBowlingRank(playerId: string | number): RankedPlayer | undefined {
    return this.bowlerRankingMap.get(String(playerId));
  }

  public resolveIdByName(name: string): string | undefined {
    return this.nameToIdMap.get(name.toLowerCase().trim());
  }

  public getAllDirectoryPlayers(): PlayerDirectoryItem[] {
    return Array.from(this.directoryMap.values());
  }
}

export const canonicalRegistry = CanonicalPlayerRegistry.getInstance();

