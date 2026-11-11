import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_021 Faceless Witch, warcry: "Buff a minion with +1/+1"
export default defineCard('CORE_021', (n) => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary)],
}));
