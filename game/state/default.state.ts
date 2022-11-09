import { gameConfig } from '../../app.config';
import actionPoints from './action-points.state';
import counts from './counts.state';
import firstRevealer from './first-revealer.state';
import playedCards from './played-cards.state';
import playerTurnDone from './player-turn-done.state';
import selectedCardData from './selected-card-data.state';
import selectedCardIndex from './selected-card-index.state';
import turn from './turn.state';
import zones from './zones.state';
import zonesCardsReference from './zones-cards-reference.state';
import players from './players.state';

const DefaultState = {
  actionPoints: actionPoints.defaultState,
  counts: counts.defaultState,
  firstRevealer: firstRevealer.defaultState,
  gameConfig: gameConfig,
  playedCards: playedCards.defaultState,
  players: players.defaultState,
  playerTurnDone: playerTurnDone.defaultState,
  selectedCardData: selectedCardData.defaultState,
  selectedCardIndex: selectedCardIndex.defaultState,
  turn: turn.defaultState,
  zones: zones.defaultState,
  zonesCardsReference: zonesCardsReference.defaultState,
};

export default DefaultState;
