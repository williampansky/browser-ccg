import { defineCard } from '../define-card';
import { disable, swapAttackAndHealth } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_048 Invoked Shaman, warcry: "Swap a minion's Attack and Health; it is Disabled"
export default defineCard('PRIME_048', () => ({
  target: anyMinion(),
  onPlay: [swapAttackAndHealth(chosenTarget()), disable(chosenTarget())],
}));
