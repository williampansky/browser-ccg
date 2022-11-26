import { GameState } from '../../types';
import { incrementGameTurnPhase } from './increment-game-turn-phase';
import { initPlayersPhase } from './init-players-phase';
import { initStartingHandsPhase } from './init-starting-hands-phase';
import { initZonesPhase } from './init-zones-phase';
import { defaultPlayCardsPhase } from './play-cards-phase';
import { revealZonePhase } from './reveal-zone-phase';

/**
 * Order of Phases:
 *  - initPlayers
 *  - initZones
 *  - initStartingHands
 *
 *  - revealZone (turns 0,1,2 only)
 *  - incrementGameTurn
 *  - playCards (p1/p2)
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
    next: 'playCards',
  },
  playCards: {
    ...defaultPlayCardsPhase,
    next: 'revealZone',
  },
};
