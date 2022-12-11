import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardRace } from '../../../enums';
import {
  cardIsNotSelf,
  pushEventStream,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * on turn end, give a friendly sprite +1 power
 */
const core013 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    zoneIndex: number,
    listenerCard: Card,
    listenerCardIndex: number,
    player: PlayerID
  ) => {
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    console.log('l')

    G.zones.forEach((z, zIdx) => {
      z.sides[player].forEach((c, cIdx) => {
        const isNotSelf = cardIsNotSelf(c, listenerCard);
        const cardIsSprite = c.race === CardRace.Sprite;

        if (isNotSelf && cardIsSprite) {
          possibleTargets.push({
            zoneNumber: zIdx,
            cardData: c,
            cardIndex: cIdx,
          });
        }
      });
    });

    // if there is a target
    if (possibleTargets.length !== 0) {
      // get a random one from the list
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

      // find the target node amonst the board zones
      const node = G.zones[choice.zoneNumber].sides[player][choice.cardIndex];

      if (!node.booleans.isBuffed) {
        node.booleans.isBuffed = true;
      }

      if (!node.booleans.hasPowerIncreased) {
        node.booleans.hasPowerIncreased = true;
      }

      // push powerStream and set display
      pushPowerStreamAndSetDisplay(
        node,
        listenerCard,
        1,
        add(node.displayPower, 1)
      );

      // set animations
      listenerCard.booleans.eventWasTriggered = true;
      pushEventStream(listenerCard, node, 'onTurnEndWasTriggered');
    }
  },
};

export default core013;
