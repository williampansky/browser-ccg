import type { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushHealthStreamAndSetDisplay } from '../../../utils';

/**
 * heal a minion for num1 hp
 */
export const core082 = (
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
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => (c.booleans.canBeHealed = true));
    z.sides[opponent].forEach((c) => (c.booleans.canBeHealed = true));
  });
};

export const core058Heal = (
  G: GameState,
  ctx: Ctx,
  opponent: PlayerID,
  cardToHealUuid: string,
  cardToBlame: Card
) => {
  // prettier-ignore
  let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

  G.zones.forEach((z, zi) => {
    z.sides[opponent].forEach((c, ci) => {
      if (c.uuid === cardToHealUuid) {
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

    G.zones[zoneNumber].sides[opponent].forEach((c, ci) => {
      if (c.uuid === card.uuid) {
        pushHealthStreamAndSetDisplay(
          c,
          cardToBlame,
          cardToBlame.numberPrimary,
          add(c.displayHealth, cardToBlame.numberPrimary)
        );
      }
    });
  }

  G.zones.forEach((z, zi) =>
    z.sides[opponent].forEach((c, ci) => {
      c.booleans.canBeHealed = false;
    })
  );
};
