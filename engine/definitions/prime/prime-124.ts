import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_124 Forest Protector: "Select One: +5 Attack; or +5 Health and Guard" (the minion itself)
export default defineCard('PRIME_124', () => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['guard'],
  choices: [
    { label: '+5 Attack', onPlay: [buff(self(), 5, 0)] },
    { label: '+5 Health and Guard', onPlay: [buff(self(), 0, 5), grantKeyword(self(), 'guard')] },
  ],
}));
