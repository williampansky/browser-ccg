import { defineCard } from '../define-card';
import { buff, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_086 item: "Buff a minion +2 Health and draw a card"
export default defineCard('CORE_086', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), 0, n.primary), draw(1)],
}));
