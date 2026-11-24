import { defineCard } from '../define-card';
import { buff, expire } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_109b (a Dream card): "Give a minion +4/+4. It dies at the start of your
// next turn"
export default defineCard('PRIME_109b', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.primary), expire(chosenTarget())],
}));
