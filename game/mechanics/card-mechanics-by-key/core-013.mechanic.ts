import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardRace } from '../../../enums';
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * on turn end, give a friendly sprite +1 power
 */
export const core013 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      // make sure not to buff itself
      if (c.uuid !== card.uuid) {
        // make sure race matches
        if (c.race === CardRace.Sprite) {
          possibleTargets.push({
            zoneNumber: zIdx,
            cardData: c,
            cardIndex: cIdx,
          });
        }
      }
    });
  });

  // if there is a target
  if (possibleTargets.length !== 0) {
    // get a random one from the list
    const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

    // find the target amonst the board zones
    const node = G.zones[choice.zoneNumber].sides[player][choice.cardIndex];

    // push powerStream and set display
    pushPowerStreamAndSetDisplay(node, card, 1, add(node.displayPower, 1));
  }
};
