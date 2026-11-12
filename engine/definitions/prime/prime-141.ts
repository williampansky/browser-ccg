import { defineCard, on } from '../define-card';
import { buffThisTurn, computed, draw } from '../../effects/primitives';
import { self } from '../../effects/selectors';
import { findMinion } from '../../rules/lookup';

// PRIME_141 Fierce Gremlin: "Whenever you cast a spell, gain +1 Attack this turn; draw a card at 4 Attack"
export default defineCard('PRIME_141', (n) => ({
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [
        buffThisTurn(self(), n.primary),
        computed((ctx) => ((ctx.self !== undefined && (findMinion(ctx.g, ctx.self)?.minion.attack ?? 0) >= 4) ? draw(1) : () => undefined)),
      ],
    }),
  ],
}));
