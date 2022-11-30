import type { Ctx } from 'boardgame.io';
import { multiply } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * double a minion's attack power
 */
export const core110 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (c.uuid !== card.uuid) c.booleans.canBeBuffed = true;
    });
  });
};

export const core110Buff = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToBuff: Card,
  cardBuffedFrom: Card
) => {
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (c.uuid === cardToBuff.uuid) {
        cardBuffedFrom.booleans.onPlayWasTriggered = true;
        pushPowerStreamAndSetDisplay(
          cardToBuff,
          cardBuffedFrom,
          multiply(cardToBuff.displayPower, 2),
          multiply(cardToBuff.displayPower, 2)
        );

        c.booleans.canBeBuffed = false;
      } else {
        c.booleans.canBeBuffed = false;
      }
    });
  });
};
