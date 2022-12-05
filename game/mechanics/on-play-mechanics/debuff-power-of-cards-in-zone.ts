import { lt } from 'lodash';
import { add } from 'mathjs';
import { CardMechanicsSide } from '../../../enums';
import type { Card, GameState, PlayerID } from '../../../types';
import { getContextualPlayerIds, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * Pushes a debuff to each card in this zone's powerStream
 */
const debuffPowerOfCardsInZone = (
  G: GameState,
  zoneNumber: number,
  cardPlayed: Card,
  player: PlayerID,
) => {
  const { mechanicsSide } = cardPlayed;
  const { opponent } = getContextualPlayerIds(player);
  const cardPlayedIdx = G.zones[zoneNumber].sides[player].findIndex(c => {
    return c.uuid === cardPlayed.uuid
  });

  const getTargetSide = () => {
    switch (mechanicsSide) {
      case CardMechanicsSide.Player:
        return player;
      case CardMechanicsSide.Opponent:
        return opponent;
      default:
        return CardMechanicsSide.Both
    }
  }

  const init = (c: Card, ci: number, cardPlayedIndex: number) => {
    const isNotCardPlayed = cardPlayed.uuid !== c.uuid;
    const cardIsBeforeCardPlayed = lt(ci, cardPlayedIndex);

    if (isNotCardPlayed && cardIsBeforeCardPlayed) {
      cardPlayed.booleans.onPlayWasTriggered = true;
      pushPowerStreamAndSetDisplay(
        c,
        cardPlayed,
        cardPlayed.numberPrimary,
        add(c.displayPower, cardPlayed.numberPrimary)
      );
    }
  }

  if (getTargetSide() === CardMechanicsSide.Both) {
    G.zones[zoneNumber].sides[player].forEach((c, ci) => init(c, ci, cardPlayedIdx));
    G.zones[zoneNumber].sides[opponent].forEach((c, ci) => init(c, ci, cardPlayedIdx));
  } else {
    G.zones[zoneNumber].sides[getTargetSide()].forEach((c, ci) => init(c, ci, cardPlayedIdx));
  }
};

export default debuffPowerOfCardsInZone;
