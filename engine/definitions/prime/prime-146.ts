import { defineCard } from '../define-card';
import { addCardToHand } from '../../effects/primitives';

// PRIME_146 Black Hole, Mystery (Spell): "When your opponent casts a spell, add a copy to your hand" (the spell still resolves)
export default defineCard('PRIME_146', () => ({
  mystery: {
    category: 'spell',
    event: 'CardPlayed',
    when: ({ event, owner, catalog }) =>
      event?.type === 'CardPlayed' && event.player !== owner && !event.mystery && catalog.get(event.cardId)?.type === 'spell',
    do: [addCardToHand((ctx) => (ctx.event?.type === 'CardPlayed' ? ctx.event.cardId : undefined))],
  },
}));
