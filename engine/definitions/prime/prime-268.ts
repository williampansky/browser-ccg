import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

const NO_COST_CHANGE = 0;

// PRIME_268 spell: "Return ALL minions to their owners' hands"
export default defineCard('PRIME_268', () => ({
  onPlay: [returnToHand(allMinions(), NO_COST_CHANGE, false, true)],
}));
