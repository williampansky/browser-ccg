import { defineCard } from '../define-card';
import { damage, drawIfDead } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_115 spell: "Deal 1 damage to a minion; if it dies, draw a card"
export default defineCard('CORE_115', (n) => ({
  target: anyMinion(),
  onPlay: [damage(chosenTarget(), n.primary), drawIfDead(chosenTarget())],
}));
