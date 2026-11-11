import { defineCard } from '../define-card';
import { buffPerOtherFriendly } from '../../effects/primitives';

// CORE_033 warcry: "Gain +1/+1 for each of your other minions"
export default defineCard('CORE_033', (n) => ({
  onPlay: [buffPerOtherFriendly(n.primary, n.secondary)],
}));
