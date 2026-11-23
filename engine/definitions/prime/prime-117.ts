import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';
import type { Effect } from '../../effects/types';

// PRIME_117: "Deal damage equal to your hero's Attack to a minion". The hero
// only has Attack through its weapon, so that is the amount (none: nothing).
const damageEqualToHeroAttack: Effect = (ctx) => {
  const { weapon } = ctx.g.players[ctx.caster];
  if (!weapon) return;

  damage(chosenTarget(), weapon.attack)(ctx);
};

export default defineCard('PRIME_117', () => ({
  target: anyMinion(),
  onPlay: [damageEqualToHeroAttack],
}));
