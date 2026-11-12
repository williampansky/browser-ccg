import { defineCard } from '../define-card';
import { destroy, heal } from '../../effects/primitives';
import { chosenTarget, ownHero } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_224 Takeover: "Destroy a minion; Return 3 HP to yourself"
export default defineCard('PRIME_224', (n) => ({
  target: anyMinion(),
  onPlay: [destroy(chosenTarget()), heal(ownHero(), n.primary)],
}));
