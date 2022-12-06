import attackMinionPhase from './attack-minion/attack-minion.phase';
import buffMinionPhase from './buff-minion/buff-minion.phase';
import destroyMinionPhase from './destroy-minion/destroy-minion.phase';
import drawCardPhase from './draw-card/draw-card.phase';
import healMinionPhase from './heal-minion/heal-minion.phase';
import incrementActionPointsPhase from './increment-action-points/increment-action-points.phase';
import incrementTurnPhase from './increment-turn/increment-turn.phase';
import initHandsPhase from './init-hands/init-hands.phase';
import initPlayersPhase from './init-players/init-players.phase';
import initZonesPhase from './init-zones/init-zones.phase';
import playCardPhase from './play-card/play-card.phase';
import removeDestroyedCardsPhase from './remove-destroyed-cards/remove-destroyed-cards.phase';
import revealZonePhase from './reveal-zone/reveal-zone.phase';

/**
 * The idea behind this evolution of the phase
 * configuration is to further extrapolate the step-by-step
 * mechanics and interactions that take place during a player's
 * turn. Due to the logic increasing—the performance and AI is
 * starting to take a hit; hence this variant's birth.
 */
export default {
  initPlayers: initPlayersPhase,
  initHands: initHandsPhase,
  initZones: initZonesPhase,
  revealZone: revealZonePhase,
  incrementTurn: incrementTurnPhase,
  incrementActionPoints: incrementActionPointsPhase,
  drawCard: drawCardPhase,
  playCard: playCardPhase,
  // removeDestroyedCards: removeDestroyedCardsPhase,
};
