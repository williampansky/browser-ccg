import { defineCard, on } from '../define-card';
import { buff, computed } from '../../effects/primitives';
import { self } from '../../effects/selectors';
import { findMinion } from '../../rules/lookup';

// PRIME_104 Perses: "At the end of each of your turns, gain +1/+1 if it attacked, else -1/-1" (it can die of it)
export default defineCard('PRIME_104', (n) => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner,
      do: [
        computed((ctx) => {
          const attacked = ctx.self !== undefined && (findMinion(ctx.g, ctx.self)?.minion.attacksThisTurn ?? 0) > 0;
          return buff(self(), attacked ? n.primary : -n.primary, attacked ? n.primary : -n.primary);
        }),
      ],
    }),
  ],
}));
