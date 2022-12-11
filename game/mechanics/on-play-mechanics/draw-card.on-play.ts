import { CardMechanicsSide as Side } from '../../../enums';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  drawCardFromPlayersDeck,
  getContextualPlayerIds,
  pushEventStream,
} from '../../../utils';

const drawCardOnPlay = (
  G: GameState,
  player: PlayerID,
  cardPlayed: Card,
  drawFromWhichDeck: Side.Player | Side.Opponent | string = Side.Player,
  drawContext: 'next' | 'random' | string = 'next'
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
    case Side.Opponent:
      invokeDraw(opponent, numberPrimary);
      break;
    case Side.Player:
    default:
      invokeDraw(player, numberPrimary);
      break;
  }

  if (onPlayWasTriggered) {
    cardPlayed.booleans.onPlayWasTriggered = true;
    pushEventStream(cardPlayed, cardPlayed, 'onPlayWasTriggered');
  }
};

export default drawCardOnPlay;
