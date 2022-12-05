import { GameState, PlayerID } from '../../../types';
import removeCardFromHand from './remove-card-from-hand';

export default function removeLastPlayedCardFromHand(
  G: GameState,
  player: PlayerID
) {
  const { lastCardPlayed: { card, index } } = G;

  if (card !== undefined && index !== undefined) {
    const cardUuid = card.uuid;
    const cardIdx = index;
    removeCardFromHand(G, player, cardUuid, cardIdx);
  } else {
    console.error('ERROR: Cannot remove last played card from hand!');
  }
}
