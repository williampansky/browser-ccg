const GAME_CONFIG = {
  airtable: {
    BASE_CONSTANTS: true,
    BASE_MECHANICS: true,
    BASE_HEROS: true,
    BASE_ABILITIES: true,
    BASE_GAME: false,
    SET_CORE: true,
    SET_PRIME: true,
    SET_ENTOURAGE: true
  },
  debugData: {
    enableAttack: true,
    enableCost: false,
    enableHealth: true,
    enableMechanics: true,
    enableSet: true,
    enableSpellType: true,
    enableText: true
  },
  devConfig: {
    autoCloseDebugPanel: false
  },
  gameAestheticConfig: {
    enableEntranceAnimations: false
  },
  matchConfig: {
    enableInitHandsStage: true,
    enableRandomTurnOrder: false
  }
};

export default GAME_CONFIG;
