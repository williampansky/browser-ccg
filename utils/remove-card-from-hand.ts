import { counts, lastCardPlayed } from '../game/state';
import { GameState, PlayerID } from '../types';
import { filterArray } from '../utils';

export default function removeCardFromHand(
  G: GameState,
  player: PlayerID,
  cardUuid: string,
  cardIndex: number,
) {
  filterArray(G.players[player].cards.hand, cardUuid, cardIndex);
  counts.decrementHand(G, player);
}
