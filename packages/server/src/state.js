import actionPoints from './state/action-points';
import boards from './state/boards';
import cardBack from './state/card-back';
import counts from './state/counts';
import deckInfo from './state/deck-info';
import hoveringCardIndex from './state/hovering-card-index';
// import onPlayObject from './state/onplay-object';
import playedCards from './state/played-cards';
import playerAttackValue from './state/player-attack-value';
import playerCanAttack from './state/player-can-attack';
import playerCanBeAttacked from './state/player-can-be-attacked';
import playerCanBeHealed from './state/player-can-be-healed';
import playerHealth from './state/player-health';
import playerHero from './state/player-hero';
import playerName from './state/player-name';
import playerHeroAbilities from './state/player-hero-abilities';
import playerIsAttacking from './state/player-is-attacking';
import playerIsDisabled from './state/player-is-disabled';
import players from './state/players';
import playerShieldPoints from './state/player-shield-points';
import playerSpellDamage from './state/player-spell-damage';
import playerWeapon from './state/player-weapon';
import selectedCardIndex from './state/selected-card-index';
import selectedCardInteractionContext from './state/selected-card-interaction-context';
import selectedCardObject from './state/selected-card-object';
import selectedMinionIndex from './state/selected-minion-index';
import selectedMinionObject from './state/selected-minion-object';
import SERVER_CONFIG from './server.config';
import spellObject from './state/spell-object';
import hoveringTarget from './state/hovering-target';

export default {
  actionPoints: actionPoints.__DATA_MODEL,
  attackedMinionIndex: null,
  cardBack: cardBack.__DATA_MODEL,
  counts: counts.__DATA_MODEL,
  hoveringCardIndex: hoveringCardIndex.__DATA_MODEL,
  hoveringTargetIndex: hoveringTarget.__DATA_MODEL,
  hoveringTargetObject: hoveringTarget.__DATA_MODEL,
  lastPlayedCardId: null,
  lastTargeted: { context: null, index: null },
  playerAttackValue: playerAttackValue.__DATA_MODEL,
  playerCanAttack: playerCanAttack.__DATA_MODEL,
  playerCanBeAttackedByMinion: playerCanBeAttacked.playerCanBeAttackedByMinion,
  playerCanBeAttackedByPlayer: playerCanBeAttacked.playerCanBeAttackedByPlayer,
  playerCanBeAttackedBySpell: playerCanBeAttacked.playerCanBeAttackedBySpell,
  playercanBeAttackedByOnPlay: playerCanBeAttacked.playercanBeAttackedByOnPlay,
  playerCanBeHealed: playerCanBeHealed.__DATA_MODEL,
  playerHasAttacked: { '0': false, '1': false },
  playerHealth: playerHealth.__DATA_MODEL,
  playerHero: playerHero.__DATA_MODEL,
  playerHeroAbilities: playerHeroAbilities.__DATA_MODEL,
  playerIsAttacking: playerIsAttacking.__DATA_MODEL,
  playerIsDisabled: playerIsDisabled.__DATA_MODEL,
  playerName: playerName.__DATA_MODEL,
  playerShieldPoints: playerShieldPoints.__DATA_MODEL,
  playerSpellDamage: playerSpellDamage.__DATA_MODEL,
  playerWeapon: playerWeapon.__DATA_MODEL,
  selectedCardIndex: selectedCardIndex.__DATA_MODEL,
  selectedCardObject: selectedCardObject.__DATA_MODEL,
  selectedCardPlayContext: { '0': null, '1': null },
  selectedCardPlayType: { '0': null, '1': null },
  selectedCardType: { '0': null, '1': null },
  selectedCardInteractionContext: selectedCardInteractionContext.__DATA_MODEL,
  selectedMinionIndex: selectedMinionIndex.__DATA_MODEL,
  selectedMinionObject: selectedMinionObject.__DATA_MODEL,
  serverConfig: SERVER_CONFIG,
  spellObject: spellObject.__DATA_MODEL,
  turnOrder: ['0', '1'].sort(() => {
    if (!SERVER_CONFIG.matchConfig.enableRandomTurnOrder) return ['0', '1'];
    return Math.random() - 0.5;
  }),
  winner: null,
  boards: boards.__DATA_MODEL,
  players: players.__DATA_MODEL,
  deckInfo: deckInfo.__DATA_MODEL,
  playedCards: playedCards.__DATA_MODEL,
  initHandsSelection: {
    '0': {
      ready: false,
      discard: [],
      cards: []
    },
    '1': {
      ready: false,
      discard: [],
      cards: []
    }
  },
  allPlayedCards: [],
  matchHistory: []
};
