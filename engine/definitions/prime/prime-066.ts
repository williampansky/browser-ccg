import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { adjacentToSelf } from '../../effects/selectors';

// PRIME_066 Ulan Gladiator, warcry: "Buff adjacent minions with +1/+1 and Guard"
export default defineCard('PRIME_066', (n) => ({
  // The data tags the keyword, but the card only grants it.
  conditionalKeywords: ['guard'],
  onPlay: [buff(adjacentToSelf(), n.primary, n.primary), grantKeyword(adjacentToSelf(), 'guard')],
}));
