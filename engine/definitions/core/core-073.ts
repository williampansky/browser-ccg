import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_073 item: "Buff a minion with +3 Attack"
export default defineCard('CORE_073', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary)],
}));
