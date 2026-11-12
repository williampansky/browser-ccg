import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_233 Battle Shield: "Buff a damaged minion with +3/+3" (either side)
export default defineCard('PRIME_233', (n) => ({
  target: minionWhere('any', (m) => m.health < m.maxHealth),
  onPlay: [buff(chosenTarget(), n.primary, n.primary)],
}));
