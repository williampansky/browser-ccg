import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_078 item: "Buff a minion with +4/+4"
export default defineCard('CORE_078', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary)],
}));
