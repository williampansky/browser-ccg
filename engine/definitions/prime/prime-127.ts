import { defineCard } from '../define-card';
import { disable, reduceAttack } from '../../effects/primitives';
import { attackerMinion } from '../../effects/selectors';

// PRIME_127 Faint Slumber, Mystery (Attack): "The next minion to attack you is Disabled and loses 2 Attack" (the attack still happens)
export default defineCard('PRIME_127', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack, owner }) => attack?.attackerId !== undefined && attack.target.kind === 'hero' && attack.target.player === owner,
    do: [disable(attackerMinion()), reduceAttack(attackerMinion(), 2)],
  },
}));
