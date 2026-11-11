import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_093 spell: "Deal 2 damage to an unhurt minion"
export default defineCard('CORE_093', (n) => ({
  target: minionWhere('any', (m) => m.health === m.maxHealth),
  onPlay: [damage(chosenTarget(), n.primary)],
}));
