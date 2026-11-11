import { defineCard } from '../define-card';
import { expire } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_114: "Destroy a minion at the start of your next turn" (RULES Q18, provisional)
export default defineCard('CORE_114', () => ({
  target: anyMinion(),
  onPlay: [expire(chosenTarget())],
}));
