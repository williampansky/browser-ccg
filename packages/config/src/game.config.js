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
  // debugData: {
  //   debugCard: 'CORE_032',
  //   enableDebugCard: true,
  //   enableAttack: true,
  //   enableCost: false,
  //   enableHealth: true,
  //   enableMechanics: true,
  //   enableSet: true,
  //   enableSpellType: true,
  //   enableText: true
  // },
  matchConfig: {
    enableInitHandsStage: true,
    enableRandomTurnOrder: false
  }
};

export default GAME_CONFIG;
