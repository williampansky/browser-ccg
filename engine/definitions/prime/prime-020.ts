import { defineCard } from '../define-card';
import { silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_020 Magic Mushroom, warcry: "Suppress a minion" (either side)
export default defineCard('PRIME_020', () => ({ target: anyMinion(), onPlay: [silence(chosenTarget())] }));
