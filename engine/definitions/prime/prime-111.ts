import { defineCard } from '../define-card';
import { buff, grantKeyword, summonEntourage } from '../../effects/primitives';
import { friendlyOfRace, lastSummoned } from '../../effects/selectors';

// PRIME_111 Untamed Potential, Select One: "+1/+1 to your Creatures; or Summon a 3/2 that has Rush" (the 3/2 is PRIME_111c, named by id: the entourage list also holds the option cards PRIME_111a and b)
export default defineCard('PRIME_111', () => ({
  choices: [
    { label: '+1/+1 to your Creatures', onPlay: [buff(friendlyOfRace('CREATURE'), 1, 1)] },
    { label: 'Summon a 3/2 with Rush', onPlay: [summonEntourage('PRIME_111c'), grantKeyword(lastSummoned(), 'rush')] },
  ],
}));
