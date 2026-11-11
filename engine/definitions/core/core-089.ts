import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_089 spell: "Destroy an enemy minion that has 3 or less Attack" (gate applies when choosing the target)
export default defineCard('CORE_089', () => ({
  target: minionWhere('enemy', (m) => m.attack <= 3),
  onPlay: [destroy(chosenTarget())],
}));
