import { gameConfig } from '../../config.app';
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

const DefaultState = {
  turn: turn.defaultState,
  actionPoints: actionPoints.defaultState,
  counts: counts.defaultState,
  gameConfig: gameConfig,
  playerTurnDone: playerTurnDone.defaultState,
  firstRevealer: firstRevealer.defaultState,

  players: {
    '0': {
      actionPoints: { current: 0, total: 0 },
      cards: { deck: [], hand: [], discarded: [], destroyed: [], played: [] },
      displayName: '',
      playerId: '',
    },
    '1': {
      actionPoints: { current: 0, total: 0 },
      cards: { deck: [], hand: [], discarded: [], destroyed: [], played: [] },
      displayName: '',
      playerId: '',
    },
  },

  selectedCardData: selectedCardData.defaultState,
  selectedCardIndex: selectedCardIndex.defaultState,
  playedCards: playedCards.defaultState,
  
  zones: zones.defaultState,
  zonesCardsReference: zonesCardsReference.defaultState,
};

export default DefaultState;
