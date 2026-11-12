import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { eventMinion } from '../../effects/selectors';

// PRIME_129 Pit Trap, Mystery (Minion): "After your opponent plays a minion, deal damage equal to its Cost to it"
export default defineCard('PRIME_129', () => ({
  mystery: {
    category: 'minion',
    event: 'MinionPlayed',
    when: ({ event, owner }) => event?.type === 'MinionPlayed' && event.player !== owner,
    do: [
      computed((ctx) => {
        const m = [...ctx.g.players['0'].board, ...ctx.g.players['1'].board].find(
          (x) => ctx.event?.type === 'MinionPlayed' && x.instanceId === ctx.event.instanceId
        );
        return damage(eventMinion(), m ? ctx.catalog.get(m.cardId)?.cost ?? 0 : 0);
      }),
    ],
  },
}));
