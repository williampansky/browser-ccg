import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_101 Knight of the Twin Suns, warcry: "Destroy an enemy minion with Guard"
export default defineCard('PRIME_101', () => ({
  target: minionWhere('enemy', (m) => m.keywords.guard),
  onPlay: [destroy(chosenTarget())],
}));
