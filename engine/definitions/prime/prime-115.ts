import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_115 Kangrinboqe Warrior: "Select One: Gain Stampede; or +2 HP and Guard" (the minion itself)
export default defineCard('PRIME_115', (n) => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['guard', 'rush'],
  choices: [
    { label: 'Gain Stampede', onPlay: [grantKeyword(self(), 'rush')] },
    { label: `+${n.primary} Health and Guard`, onPlay: [buff(self(), 0, n.primary), grantKeyword(self(), 'guard')] },
  ],
}));
