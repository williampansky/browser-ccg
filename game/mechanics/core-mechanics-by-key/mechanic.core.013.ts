import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardRace } from '../../../enums';
import {
  cardIsNotSelf,
  getCardPower,
  isBotGame,
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

    console.log('l');

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

      if (choice) {
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
          listenerCard.numberPrimary,
          add(node.displayPower, listenerCard.numberPrimary)
        );

        // set animations
        if (isBotGame(ctx)) {
          aiSpread(G, ctx, player, zoneIndex, listenerCard, choice.cardData);
        } else {
          listenerCard.booleans.eventWasTriggered = true;
          pushEventStream(listenerCard, node, 'onTurnEndWasTriggered');
        }
      }
    }
  },
};

function aiSpread(
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  cardToAdjust: Card,
  cardToBlame?: Card
) {
  const cardToAdjustIdx = G.zones[zoneNumber].sides[player].findIndex((o) => {
    return o.uuid === cardToAdjust.uuid;
  });

  // push streams
  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    booleans: {
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].booleans,
      eventWasTriggered: true,
    },
    eventStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].eventStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        event: 'onTurnEndWasTriggered',
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
  };
}

export default core013;
