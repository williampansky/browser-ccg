import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_135 Behemoth Slayer, On Play effect: "Destroy a minion with 7 or more
// attack power" (an enemy one: with only your own big minion on the board it is
// just played, so it never forces you to hit yourself)
export default defineCard('CORE_135', (n) => ({
  target: minionWhere('enemy', (m) => m.attack >= n.primary),
  onPlay: [destroy(chosenTarget())],
}));
