import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { attackerMinion } from '../../effects/selectors';

// PRIME_126 Rage Unleashed, Mystery (Attack): "When an enemy minion attacks you, your weapon hits it first for its Attack (needs a weapon)"
// (the weapon loses no durability; if that kills the attacker, the attack does not happen)
export default defineCard('PRIME_126', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack, owner, state }) =>
      attack?.attackerId !== undefined && attack.target.kind === 'hero' && attack.target.player === owner && !!state.players[owner].weapon,
    do: [computed((ctx) => damage(attackerMinion(), ctx.g.players[ctx.caster].weapon?.attack ?? 0))],
  },
}));
