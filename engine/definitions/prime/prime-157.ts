import { defineCard } from '../define-card';
import { redirectAttackToSummoned, summonEntourage } from '../../effects/primitives';

// PRIME_157 The Wrong Door, Mystery (Attack): "When an enemy attacks, summon two 1/1 Mice with Guard; the attack hits a Mouse"
// (any enemy attack: a minion's or the hero's weapon; with no room for a Mouse the attack is not redirected)
export default defineCard('PRIME_157', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack }) => !!attack,
    do: [summonEntourage(), summonEntourage(), redirectAttackToSummoned()],
  },
}));
