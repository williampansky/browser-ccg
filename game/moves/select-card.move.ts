import type { Ctx, LongFormMove } from 'boardgame.io';
import type { GameState, PlayerID } from '../../types';
import { LastMoveMade } from '../../enums';
import { selectedCardData } from '../state';

export interface SelectCardMove {
  player: PlayerID;
  cardUuid: string;
}

export const selectCardMove = (
  G: GameState,
  ctx: Ctx,
  { player, cardUuid }: SelectCardMove
) => {
  const hand = G.players[player].cards.hand;
  const cardMatch = hand.find((c) => c.uuid === cardUuid);
  const cardMatchIndex = hand.findIndex((c) => c.uuid === cardUuid);

  if (G.selectedCardData[player]?.uuid === cardMatch?.uuid) {
    selectedCardData.reset(G, player);
    G.lastMoveMade = LastMoveMade.DeselectCard;
  } else {
    selectedCardData.set(G, player, cardMatch!);
    G.selectedCardIndex[player] = cardMatchIndex;
    G.lastMoveMade = LastMoveMade.SelectCard;
  }
};

export const selectCard: LongFormMove = {
  client: false,
  noLimit: true,
  ignoreStaleStateID: false,
  undoable: false,
  move: (G: GameState, ctx: Ctx, { player, cardUuid }: SelectCardMove) => {
    return selectCardMove(G, ctx, { player, cardUuid });
  },
};
