import { GameState, PlayerID } from '../../../../types';
import { filterArray } from '../../../../utils';
import { counts } from '../../../state';

export default function removeCardFromHand(
  G: GameState,
  player: PlayerID,
  cardUuid: string,
  cardIndex: number,
) {
  filterArray(G.players[player].cards.hand, cardUuid, cardIndex);
  counts.decrementHand(G, player);
}
