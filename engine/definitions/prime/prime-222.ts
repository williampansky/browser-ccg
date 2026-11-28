import { defineCard } from '../define-card';
import { devourFriendlies } from '../../effects/primitives';
import { adjacentToSelf } from '../../effects/selectors';

// PRIME_222, On Play effect: "Destroy adjacent friendly minions and gain
// their Attack and Health"
export default defineCard('PRIME_222', () => ({
  onPlay: [devourFriendlies(adjacentToSelf())],
}));
