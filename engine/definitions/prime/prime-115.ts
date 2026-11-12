import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_115 Kangrinboqe Warrior, Select One: "Gain Rush and +1 Attack; or +3 Health and Guard" (the minion itself)
export default defineCard('PRIME_115', () => ({
  // The data tags the keywords, but the card only grants them.
  conditionalKeywords: ['guard', 'rush'],
  choices: [
    { label: 'Gain Rush and +1 Attack', onPlay: [grantKeyword(self(), 'rush'), buff(self(), 1, 0)] },
    { label: '+3 Health and Guard', onPlay: [buff(self(), 0, 3), grantKeyword(self(), 'guard')] },
  ],
}));
