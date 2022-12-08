import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../types';

const resetCardTargetBooleans = (G: GameState, ctx: Ctx, player?: PlayerID) => {
  const init = (c: Card) => {
    c.booleans = {
      ...c.booleans,
      canBeAttackedBySpell: false,
      canBeAttackedByWeapon: false,
      canBeBuffed: false,
      canBeDestroyed: false,
      canBeHealed: false,
      eventWasTriggered: false,
    };
  };

  G.zones.forEach((z) => {
    z.sides['0'].forEach((c) => init(c));
    z.sides['1'].forEach((c) => init(c));
  });
};

export default resetCardTargetBooleans;
