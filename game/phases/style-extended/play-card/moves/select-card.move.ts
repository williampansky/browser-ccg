import { Ctx } from 'boardgame.io';
import { Card, GameState } from '../../../../../types';
import { selectedCardData } from '../../../../state';

export interface SelectCardMove {
  G: GameState;
  ctx: Ctx;
  cardUuid: string;
}

export const selectCard = ({ ...props }: SelectCardMove) => {
  const {
    G,
    ctx: { currentPlayer },
    cardUuid,
  } = props;

  const player = currentPlayer;
  const hand = G.players[player].cards.hand;
  const cardMatch = hand.find((c: Card) => c.uuid === cardUuid);
  const cardMatchIndex = hand.findIndex((c: Card) => c.uuid === cardUuid);

  if (G.selectedCardData[player]?.uuid === cardMatch!.uuid) {
    selectedCardData.reset(G, player);
    G.lastMoveMade = 'deselectCard';
  } else {
    selectedCardData.set(G, player, cardMatch!);
    G.selectedCardIndex[player] = cardMatchIndex;
    G.lastMoveMade = 'selectCard';
  }
};
