import { add } from 'mathjs';
import { CardRace } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * buff: give a creature +4 attack power
 */
const core031 = {
  init: (G: G, player: PlayerID, card: Card) => {
    const { opponent } = getContextualPlayerIds(player);
    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isCreature = c.race === CardRace.Creature;
        if (isNotSelf && isCreature) c.booleans.canBeBuffed = true;
      });

      z.sides[opponent].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isCreature = c.race === CardRace.Creature;
        if (isNotSelf && isCreature) c.booleans.canBeBuffed = true;
      });
    });
  },

  exec: (G: G, targetPlayer: PlayerID, targetCard: Card, playedCard: Card) => {
    const { player, opponent } = getContextualPlayerIds(targetPlayer);
    const { numberPrimary } = playedCard;

    // prettier-ignore
    let target: {
      card: Card,
      cardIdx: number,
      zoneNumber: number
    } | undefined;

    G.zones.forEach((z, zi) => {
      z.sides[targetPlayer].forEach((c, ci) => {
        if (cardUuidMatch(c, targetCard)) {
          target = {
            card: c,
            cardIdx: ci,
            zoneNumber: zi,
          };
        }
      });
    });

    if (target !== undefined) {
      const { card, cardIdx, zoneNumber } = target;

      G.zones[zoneNumber].sides[targetPlayer].forEach((c, ci) => {
        const isTargetedCard = cardUuidMatch(c, card) && ci === cardIdx;
        if (isTargetedCard) {
          c.booleans.isBuffed = true;
          c.booleans.hasPowerIncreased = true;
          pushPowerStreamAndSetDisplay(
            c,
            playedCard,
            numberPrimary,
            add(c.displayPower, 2)
          );
        }
      });
    }

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        c.booleans.canBeBuffed = false;
        if (target !== undefined && cardUuidMatch(c, playedCard)) {
          c.booleans.onPlayWasTriggered = true;
          pushEventStream(c, c, 'onPlayWasTriggered');
        }
      });

      z.sides[opponent].forEach((c) => {
        c.booleans.canBeBuffed = false;
      });
    });
  },
};

export default core031;
