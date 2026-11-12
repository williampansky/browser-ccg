import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { attackerMinion } from '../../effects/selectors';
import { MAX_HEALTH } from '../../state/types';

// PRIME_148 Watch Your Back!, Mystery (Attack): "When an enemy minion attacks your hero, it takes damage equal to your hero's missing Health"
// (if that kills it, the attack does not happen)
export default defineCard('PRIME_148', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack, owner }) => attack?.attackerId !== undefined && attack.target.kind === 'hero' && attack.target.player === owner,
    do: [computed((ctx) => damage(attackerMinion(), Math.max(0, MAX_HEALTH - ctx.g.players[ctx.caster].health)))],
  },
}));
