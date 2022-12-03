import { GameState, PlayerID } from '../../../../../types';
import { cardIsNotSelf, getContextualPlayerIds } from '../../../../../utils';
import { selectedCardData, selectedCardIndex } from '../../../../state';

interface Props {
  G: GameState;
  player: PlayerID;
}

export const determineHealableMinions = ({ G, player }: Props) => {
  const { playedCards } = G;
  const { opponent } = getContextualPlayerIds(player);
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard) && c.booleans.hasHealthReduced) {
        c.booleans.canBeHealed = true;
      }
    });

    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard) && c.booleans.hasHealthReduced) {
        c.booleans.canBeHealed = true;
      }
    });
  });

  selectedCardData.reset(G, player);
  selectedCardIndex.reset(G, player);
};
