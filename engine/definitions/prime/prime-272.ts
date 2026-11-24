import { defineCard } from '../define-card';
import { destroy, targetOwnerDraws } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_272 spell: "Destroy a minion. Its owner draws 2 cards"
export default defineCard('PRIME_272', (n) => ({
  target: anyMinion(),
  onPlay: [targetOwnerDraws(n.primary), destroy(chosenTarget())],
}));
