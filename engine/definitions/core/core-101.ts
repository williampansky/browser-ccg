import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_101 spell: "Destroy a minion"
export default defineCard('CORE_101', () => ({
  target: anyMinion(),
  onPlay: [destroy(chosenTarget())],
}));
