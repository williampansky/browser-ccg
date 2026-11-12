import { defineCard } from '../define-card';
import { computed, damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_151 Telekinesis: "Deal 2 damage to a minion; if it was Disabled, draw a card" (checked before the damage)
export default defineCard('PRIME_151', (n) => ({
  target: anyMinion(),
  onPlay: [
    computed((ctx) => {
      const m = ctx.target?.kind === 'minion' ? findMinion(ctx.g, ctx.target.instanceId)?.minion : undefined;
      return m?.disabledOnTurn !== undefined && m.disabledOnTurn >= ctx.g.turn ? draw(1) : () => undefined;
    }),
    damage(chosenTarget(), n.primary),
  ],
}));
