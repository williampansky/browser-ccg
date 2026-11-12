import { defineCard } from '../define-card';
import { computed, damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { enemyMinion } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_234 Burning Chrysalis: "Deal 2 damage to an enemy minion; draw a card if it survives"
export default defineCard('PRIME_234', (n) => ({
  target: enemyMinion(),
  onPlay: [
    damage(chosenTarget(), n.primary),
    computed((ctx) => {
      const m = ctx.target?.kind === 'minion' ? findMinion(ctx.g, ctx.target.instanceId)?.minion : undefined;
      return m && m.health > 0 ? draw(1) : () => undefined;
    }),
  ],
}));
