import { defineCard } from '../define-card';
import { buffThisTurnBoth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_051a Chopped Desert Lizard (item): "Give a minion +1/+1 for one turn only"
export default defineCard('PRIME_051a', () => ({ target: anyMinion(), onPlay: [buffThisTurnBoth(chosenTarget(), 1, 1)] }));
