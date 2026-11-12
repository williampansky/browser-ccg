import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_241 Outer Beam: "Deal damage to a minion equal to that of your Armor" (armor is not spent)
export default defineCard('PRIME_241', () => ({
  target: anyMinion(),
  onPlay: [computed((ctx) => damage(chosenTarget(), ctx.g.players[ctx.caster].armor))],
}));
