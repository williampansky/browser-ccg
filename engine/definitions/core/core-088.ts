import { defineCard } from '../define-card';
import { doubleHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_088 spell: "Double a minion's current Health value"
export default defineCard('CORE_088', () => ({
  target: anyMinion(),
  onPlay: [doubleHealth(chosenTarget())],
}));
