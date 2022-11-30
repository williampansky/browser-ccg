import type { Ctx } from 'boardgame.io';
import { subtract } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushHealthStreamAndSetDisplay } from '../../../utils';

/**
 * deal 1 damage to everyone else
 */
export const core122 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  const { numberPrimary } = card;
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (c.uuid !== card.uuid) {
        card.booleans.onPlayWasTriggered = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });

    z.sides[opponent].forEach((c) => {
      if (c.uuid !== card.uuid) {
        card.booleans.onPlayWasTriggered = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });
  });
};
