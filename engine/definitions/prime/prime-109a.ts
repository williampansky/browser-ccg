import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

const NO_COST_CHANGE = 0;

// PRIME_109a (a Dream card): "Return a minion to its owner's hand"
export default defineCard('PRIME_109a', () => ({
  target: anyMinion(),
  onPlay: [returnToHand(chosenTarget(), NO_COST_CHANGE, false, true)],
}));
