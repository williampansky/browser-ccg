import { defineCard } from '../define-card';
import { buff, grantKeyword, summonEntourage } from '../../effects/primitives';
import { friendlyOfRace, lastSummoned } from '../../effects/selectors';

// PRIME_111 Untamed Potential, Select One: "+1/+1 to your Creatures; or Summon
// a 3/2 that has Rush" (the option cards are PRIME_111a and b; b lists the 3/2
// token PRIME_111c, which is summoned by id)
export default defineCard('PRIME_111', () => ({
  choices: [
    {
      label: '+1/+1 to your Creatures',
      onPlay: [buff(friendlyOfRace('CREATURE'), 1, 1)],
    },
    {
      label: 'Summon a 3/2 with Rush',
      onPlay: [
        summonEntourage('PRIME_111c'),
        grantKeyword(lastSummoned(), 'rush'),
      ],
    },
  ],
}));
