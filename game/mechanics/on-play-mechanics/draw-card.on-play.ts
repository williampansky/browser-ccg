import type { Card, GameState, PlayerID } from '../../../types';
import {
  drawCardFromPlayersDeck,
  getContextualPlayerIds,
} from '../../../utils';

const drawCardOnPlay = (
  G: GameState,
  player: PlayerID,
  cardPlayed: Card,
  drawFromWhichDeck: 'player' | 'opponent' = 'player',
  drawContext: 'next' | 'random' = 'next'
) => {
  const { numerics } = G.gameConfig;
  const { numberPrimary } = cardPlayed;
  const { opponent } = getContextualPlayerIds(player);
  let onPlayWasTriggered: boolean = false;

  const invokeDraw = (playerId: PlayerID, amount: number) => {
    if (G.players[player].cards.hand.length < numerics.cardsPerHand) {
      onPlayWasTriggered = true;
      drawCardFromPlayersDeck(G, playerId, amount, drawContext);
    }
  }

  switch (drawFromWhichDeck) {
    case 'opponent':
      invokeDraw(opponent, numberPrimary);
      break;
    case 'player':
    default:
      invokeDraw(player, numberPrimary);
      break;
  }

  if (onPlayWasTriggered) {
    cardPlayed.booleans.onPlayWasTriggered = true;
  }
};

export default drawCardOnPlay;
