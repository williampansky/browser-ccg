import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_082 Foxy Huntsman, warcry: "Destroy a minion that has an AP of 7+" (either side)
export default defineCard('PRIME_082', () => ({
  target: minionWhere('any', (m) => m.attack >= 7),
  onPlay: [destroy(chosenTarget())],
}));
