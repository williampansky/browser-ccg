import { defineCard } from '../define-card';
import { damage, drawIfDead } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_203 Flash Strike: "Deal 3 damage to a minion; draw a card if it dies. Overcharge (1)" (the lock is applied in play-card.ts)
export default defineCard('PRIME_203', (n) => ({
  target: anyMinion(),
  onPlay: [damage(chosenTarget(), n.primary), drawIfDead(chosenTarget())],
}));
