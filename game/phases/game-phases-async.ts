import { drawCardPhase } from './draw-card-phase';
import { handleZonePowerCalculationsPhase } from './handle-zone-power-calculations-phase';
import { incrementGameTurnPhase } from './increment-game-turn-phase';
import { initCardMechanicsPhase } from './init-card-mechanics-phase';
import { initPlayersPhase } from './init-players-phase';
import { initStartingHandsPhase } from './init-starting-hands-phase';
import { initZoneInteractionsPhase } from './init-zone-interactions-phase';
import { initZonesPhase } from './init-zones-phase';
import { asyncPlayCardsPhase } from './play-cards-phase';
import { revealCardsFaceDownPhase } from './reveal-cards-face-down-phase';
import { revealCardsPhase } from './reveal-cards-phase';
import { revealZonePhase } from './reveal-zone-phase';

/**
 * Order of Phases:
 *  - initPlayers
 *  - initZones
 *  - initStartingHands
 *
 *  - revealZone (turns 0,1,2 only)
 *  - incrementGameTurn
 *  - drawCard
 *  - playCards
 *  - revealCardsFaceDown
 *  - revealCards
 *  - initCardMechanics
 *  - initZoneInteractions
 *  - handleZonePowerCalculations
 *
 *  - incrementGameTurn
 *  - drawCard
 *  - playCards
 *  - etc... loop until game ends
 */
export default {
  initPlayers: {
    ...initPlayersPhase,
    next: 'initZones',
    start: true,
  },
  initZones: {
    ...initZonesPhase,
    next: 'initStartingHands',
  },
  initStartingHands: {
    ...initStartingHandsPhase,
    next: 'revealZone',
  },
  revealZone: {
    ...revealZonePhase,
    next: 'incrementGameTurn',
  },
  incrementGameTurn: {
    ...incrementGameTurnPhase,
    next: 'drawCard',
  },
  drawCard: {
    ...drawCardPhase,
    next: 'playCards',
  },
  playCards: {
    ...asyncPlayCardsPhase,
    next: 'revealCardsFaceDown',
  },
  revealCardsFaceDown: {
    ...revealCardsFaceDownPhase,
    next: 'revealCards',
  },
  revealCards: {
    ...revealCardsPhase,
    next: 'initCardMechanics',
  },
  initCardMechanics: {
    ...initCardMechanicsPhase,
    next: 'initZoneInteractions',
  },
  initZoneInteractions: {
    ...initZoneInteractionsPhase,
    next: 'handleZonePowerCalculations',
  },
  handleZonePowerCalculations: {
    ...handleZonePowerCalculationsPhase,
    next: 'revealZone',
  },
};
