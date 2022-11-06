export const gameConfig = {
  debugConfig: {
    debugCardId: '',
    logPhaseToConsole: false,
    showDebugBar: true,
  },
  numerics: {
    actionPointsPerTurn: 1,
    actionPointsTotal: 10,
    cardsPerDeck: 20,
    cardsPerHand: 8,
    cardsPerStartingHand: 3,
    cardsPerTurn: 1,
    numberOfPlayers: 2,
    numberOfSingleTurnsPerGame: 12,
    numberOfSlotsPerZone: 6,
    numberOfZones: 3,
  },
}

const appConfig = {
  gameConfig: { ...gameConfig },
  siteConfig: {},
}

export default appConfig;
