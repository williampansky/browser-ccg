import { defineCard } from '../define-card';
import { computed, damage, destroy } from '../../effects/primitives';
import { allEnemyMinions, chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_223 Cursed Concoction: "Destroy a friendly minion; deal its Attack to all enemy minions"
export default defineCard('PRIME_223', () => ({
  target: friendlyMinion(),
  onPlay: [
    computed((ctx) => {
      const m = ctx.target?.kind === 'minion' ? findMinion(ctx.g, ctx.target.instanceId)?.minion : undefined;
      return damage(allEnemyMinions(), m?.attack ?? 0);
    }),
    destroy(chosenTarget()),
  ],
}));
