import drawCardPhase from './style-extended/draw-card/draw-card.phase';
import healMinionPhase from './style-extended/heal-minion/heal-minion.phase';
import incrementActionPointsPhase from './style-extended/increment-action-points/increment-action-points.phase';
import incrementTurnPhase from './style-extended/increment-turn/increment-turn.phase';
import initHandsPhase from './style-extended/init-hands/init-hands.phase';
import initPlayersPhase from './style-extended/init-players/init-players.phase';
import initZonesPhase from './style-extended/init-zones/init-zones.phase';
import playCardPhase from './style-extended/play-card/play-card.phase';
import revealZonePhase from './style-extended/reveal-zone/reveal-zone.phase';

/**
 * The idea behind this `extended` variant of the phase
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
  healMinion: healMinionPhase,
};
