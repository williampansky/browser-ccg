export interface GameConfig {
  debugConfig: {
    debugCardId: string;
    logPhaseToConsole: boolean;
  };
  numerics: {
    actionPointsPerTurn: number;
    actionPointsTotal: number;
    cardsPerDeck: number;
    cardsPerHand: number;
    cardsPerStartingHand: number;
    cardsPerTurn: number;
    numberOfPlayers: number;
    numberOfSingleTurnsPerGame: number;
    numberOfSlotsPerZone: number;
    numberOfZones: number;
  };
}

export interface SiteConfig {

}

export interface AppConfig {
  gameConfig: GameConfig;
  siteConfig: SiteConfig;
}
