import castGame001 from './game.001';
import initCoreSpell from './core-spells';

const playSpellByCardId = (G, ctx, cardId, target = null) => {
  G.lastPlayedCardId = cardId;

  // prettier-ignore
  switch (cardId) {
    // game
    case 'GAME_001': return castGame001(G, ctx);

    // core
    case 'CORE_043':
    case 'CORE_045':
    case 'CORE_048':
    case 'CORE_049':
    case 'CORE_055':
    case 'CORE_057':
    case 'CORE_060':
    case 'CORE_063':
    case 'CORE_064':
    case 'CORE_065':
    case 'CORE_067':
    case 'CORE_068':
    case 'CORE_070':
    case 'CORE_072':
    case 'CORE_079':
    case 'CORE_084':
    case 'CORE_087':
    case 'CORE_091':
    case 'CORE_094':
    case 'CORE_095':
    case 'CORE_098':
    case 'CORE_102':
    case 'CORE_104':
    case 'CORE_109':
    case 'CORE_111':
    case 'CORE_121':
    case 'CORE_124':
    case 'CORE_125':
    case 'CORE_126':
    case 'CORE_127':
    case 'CORE_129': return initCoreSpell(G, ctx, cardId, target);

    // eject
    default: return;
  }
};

export default playSpellByCardId;
