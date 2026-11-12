import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';
import type { Effect } from '../../effects/types';

// PRIME_241 Outer Beam: "Deal damage to a minion equal to your Armor, then lose half of it (rounded up)"
const loseHalfArmor: Effect = (ctx) => {
  const p = ctx.g.players[ctx.caster];
  p.armor -= Math.ceil(p.armor / 2);
};
export default defineCard('PRIME_241', () => ({
  target: anyMinion(),
  onPlay: [computed((ctx) => damage(chosenTarget(), ctx.g.players[ctx.caster].armor)), loseHalfArmor],
}));
