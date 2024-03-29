import { gameConfig } from '../../app.config';
import actionPoints from './action-points.state';
import canUndo from './can-undo.state';
import counts from './counts.state';
import firstRevealer from './first-revealer.state';
import playedCards from './played-cards.state';
import playerNames from './player-names.state';
import players from './players.state';
import playerTurnDone from './player-turn-done.state';
import selectedCardData from './selected-card-data.state';
import selectedCardIndex from './selected-card-index.state';
import turn from './turn.state';
import turnOrder from './turn-order.state';
import zones from './zones.state';
import zonesCardsReference from './zones-cards-reference.state';
import lastCardPlayed from './last-card-played.state';

const DefaultState = {
  actionPoints: actionPoints.defaultState,
  aiLoading: true,
  aiPossibleCards: [],
  canUndo: canUndo.defaultState,
  counts: counts.defaultState,
  firstRevealer: firstRevealer.defaultState,
  gameConfig: gameConfig,
  lastCardPlayed: lastCardPlayed.defaultState,
  lastMoveMade: undefined,
  playedCards: playedCards.defaultState,
  playerNames: playerNames.defaultState,
  players: players.defaultState,
  playerTurnDone: playerTurnDone.defaultState,
  selectedCardData: selectedCardData.defaultState,
  selectedCardIndex: selectedCardIndex.defaultState,
  turn: turn.defaultState,
  totalTurns: gameConfig.numerics.numberOfSingleTurnsPerGame,
  turnOrder: turnOrder.defaultState,
  zones: zones.defaultState,
  zonesCardsReference: zonesCardsReference.defaultState,
};

export default DefaultState;
