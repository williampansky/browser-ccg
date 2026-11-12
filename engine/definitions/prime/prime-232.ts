import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_232 Blessed Shaman, warcry: "Trade 1 point of a minion's Health for +2 Attack points" (lowers Health itself, not damage)
export default defineCard('PRIME_232', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), 2 * n.primary, -n.primary)],
}));
