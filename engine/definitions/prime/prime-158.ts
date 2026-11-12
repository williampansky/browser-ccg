import { defineCard } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// PRIME_158 Resurrection, Mystery (Death): "When your minion dies, return it to your hand; it costs 1 less" (tokens are not returned)
export default defineCard('PRIME_158', () => ({
  mystery: {
    category: 'death',
    event: 'MinionDied',
    when: ({ event, owner, catalog }) => event?.type === 'MinionDied' && event.player === owner && catalog.get(event.cardId)?.isToken === false,
    do: [addCardToHand((ctx) => (ctx.event?.type === 'MinionDied' ? ctx.event.cardId : undefined), -1)],
  },
}));
