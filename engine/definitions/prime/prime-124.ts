import { defineCard } from '../define-card';
import { buff, grantKeyword, heal } from '../../effects/primitives';
import { ownHero, self } from '../../effects/selectors';

// PRIME_124 Forest Protector, Select One: "+3 Attack and Rush; or +3 Health, Guard and heal your hero 3" (the minion itself)
export default defineCard('PRIME_124', () => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['guard'],
  choices: [
    { label: '+3 Attack and Rush', onPlay: [buff(self(), 3, 0), grantKeyword(self(), 'rush')] },
    { label: '+3 Health, Guard and heal your hero 3', onPlay: [buff(self(), 0, 3), grantKeyword(self(), 'guard'), heal(ownHero(), 3)] },
  ],
}));
