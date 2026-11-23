import { defineCard } from '../define-card';
import { buff, summonEntourage } from '../../effects/primitives';
import { otherFriendlyMinions } from '../../effects/selectors';

// PRIME_125, Select One: "Give your other minions +2/+2; or Summon two 2/2
// Treants with Taunt" (the option cards are PRIME_125a and b; b lists the
// Treant token PRIME_125c, which is summoned by id)
export default defineCard('PRIME_125', () => ({
  choices: [
    {
      label: 'Give your other minions +2/+2',
      onPlay: [buff(otherFriendlyMinions(), 2, 2)],
    },
    {
      label: 'Summon two 2/2 Treants with Taunt',
      onPlay: [summonEntourage('PRIME_125c'), summonEntourage('PRIME_125c')],
    },
  ],
}));
