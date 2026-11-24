import { defineCard } from '../define-card';
import { redirectAttackToRandomOther } from '../../effects/primitives';

// PRIME_133 Mystery (Attack): "When a character attacks your hero, instead it
// attacks another random character" (any character but the one it aimed at and
// the attacker; the attack is only redirected when it was aimed at your hero)
export default defineCard('PRIME_133', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack, owner }) =>
      attack?.target.kind === 'hero' && attack.target.player === owner,
    do: [redirectAttackToRandomOther],
  },
}));
