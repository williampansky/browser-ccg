import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget, neighboursOfTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_208 Ionic Incineration: "Deal 4 damage to a minion and 2 to its neighbours. Overcharge (2)"
export default defineCard('PRIME_208', (n) => ({
  target: anyMinion(),
  onPlay: [damage(neighboursOfTarget(), 2), damage(chosenTarget(), n.primary)],
}));
