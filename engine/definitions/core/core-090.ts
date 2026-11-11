import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_090 spell: "Destroy an enemy minion that has 5 or more Attack"
export default defineCard('CORE_090', () => ({
  target: minionWhere('enemy', (m) => m.attack >= 5),
  onPlay: [destroy(chosenTarget())],
}));
