import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { adjacentToSelf } from '../../effects/selectors';

// PRIME_054 Frightened Child, warcry: "Give adjacent minions Guard"
export default defineCard('PRIME_054', () => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['guard'],
  onPlay: [grantKeyword(adjacentToSelf(), 'guard')],
}));
