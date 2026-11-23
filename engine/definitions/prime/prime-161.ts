import { defineCard } from '../define-card';
import { halveAttack } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_161 Enigmatic Courier (2/3), On Play effect: "A minion's Attack is halved (rounded down)"
export default defineCard('PRIME_161', () => ({
  target: anyMinion(),
  onPlay: [halveAttack(chosenTarget())],
}));
