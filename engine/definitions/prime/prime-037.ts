import { defineCard } from '../define-card';

// PRIME_037 Skelly (7/6): "Your minions cost 3 more" (read as a standing effect on its owner's own minions, while it is on the board;
// the data tags it as a warcry, so this is a reading to confirm)
export default defineCard('PRIME_037', (n) => ({ costMods: [{ affects: (card) => card.type === 'minion', delta: n.primary }] }));
