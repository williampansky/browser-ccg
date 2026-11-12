import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { mostDamagedFriendly, ownHero } from '../../effects/selectors';

// PRIME_176 Shaman Wudu: "At the end of your turn, heal your most damaged minion 3 and your hero 1"
export default defineCard('PRIME_176', (n) => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [heal(mostDamagedFriendly(), n.primary), heal(ownHero(), 1)] })],
}));
