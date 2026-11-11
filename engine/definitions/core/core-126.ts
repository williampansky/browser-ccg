import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_126 spell: "Destroy an already damaged minion" (either side, per the printed text)
export default defineCard('CORE_126', () => ({
  target: minionWhere('any', (m) => m.health < m.maxHealth),
  onPlay: [destroy(chosenTarget())],
}));
