import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_185 Into the Shadows: "Return a friendly minion to your hand; it costs 1 less and has Rush when played"
export default defineCard('PRIME_185', (n) => ({ target: friendlyMinion(), onPlay: [returnToHand(chosenTarget(), -n.primary, true)] }));
