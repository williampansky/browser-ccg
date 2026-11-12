import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_026, warcry: "Return a friendly minion to your hand" (not itself: it is not on the board yet when you aim)
export default defineCard('PRIME_026', () => ({ target: friendlyMinion(), onPlay: [returnToHand(chosenTarget())] }));
