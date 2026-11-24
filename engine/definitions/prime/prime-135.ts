import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget, neighboursOfTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

const NEIGHBOUR_DAMAGE = 2;

// PRIME_135 spell: "Deal 5 damage to a minion and 2 damage to adjacent ones"
export default defineCard('PRIME_135', (n) => ({
  target: anyMinion(),
  onPlay: [
    damage(chosenTarget(), n.primary),
    damage(neighboursOfTarget(), NEIGHBOUR_DAMAGE),
  ],
}));
