import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_160 BattleMage, warcry: "Buff a friendly minion with Bubble"
export default defineCard('PRIME_160', () => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['bubble'],
  target: friendlyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'bubble')],
}));
