import { defineCard } from '../define-card';
import { buff, computed, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_269 spell: "Deal 2 damage to a minion. If it is Demonic, give it
// +2/+2 instead"
export default defineCard('PRIME_269', (n) => ({
  target: anyMinion(),
  onPlay: [
    computed((ctx) => {
      const found =
        ctx.target?.kind === 'minion' &&
        findMinion(ctx.g, ctx.target.instanceId);
      const isDemonic =
        !!found && ctx.catalog.get(found.minion.cardId)?.race === 'DEMONIC';

      return isDemonic
        ? buff(chosenTarget(), n.primary, n.primary)
        : damage(chosenTarget(), n.primary);
    }),
  ],
}));
