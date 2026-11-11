import { defineCard } from '../define-card';
import { setHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_056 spell: "Debuff a minion's Health to 1"
export default defineCard('CORE_056', () => ({
  target: anyMinion(),
  onPlay: [setHealth(chosenTarget(), 1)],
}));
