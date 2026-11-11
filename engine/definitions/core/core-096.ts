import { defineCard } from '../define-card';
import { disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_096: "Disable a minion"
export default defineCard('CORE_096', () => ({
  target: anyMinion(),
  onPlay: [disable(chosenTarget())],
}));
