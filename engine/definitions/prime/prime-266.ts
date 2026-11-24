import { defineCard } from '../define-card';
import { returnToHand } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';

// PRIME_266 spell: "Return an enemy minion to its owner's hand; it costs 1
// more"
export default defineCard('PRIME_266', (n) => ({
  target: enemyMinion(),
  onPlay: [returnToHand(chosenTarget(), n.primary, false, true)],
}));
