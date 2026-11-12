import { defineCard } from '../define-card';
import { computed, draw, silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_032 Siren, warcry: "Suppress an enemy minion; draw a card if it had a warcry or a demise" (judged by its card, before it is Suppressed)
export default defineCard('PRIME_032', () => ({
  target: enemyMinion(),
  onPlay: [
    computed((ctx) => {
      const m = ctx.target?.kind === 'minion' ? findMinion(ctx.g, ctx.target.instanceId)?.minion : undefined;
      const mech = (m && ctx.catalog.get(m.cardId)?.mechanics) ?? [];
      const had = !!m && !m.silenced && (mech.includes('ON_PLAY') || mech.includes('ON_DEATH'));
      return (c) => {
        silence(chosenTarget())(c);
        if (had) draw(1)(c);
      };
    }),
  ],
}));
