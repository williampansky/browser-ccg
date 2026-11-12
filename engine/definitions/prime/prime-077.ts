import { defineCard } from '../define-card';
import { buff, computed, destroy } from '../../effects/primitives';
import { chosenTarget, self } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';
import { findMinion } from '../../rules/lookup';

// PRIME_077 Phantom Spider, warcry: "Destroy a friendly Sprite and gain its stats" (its current Attack and Health)
export default defineCard('PRIME_077', () => ({
  target: minionWhere('friendly', (_m, race) => race === 'SPRITE'),
  onPlay: [
    computed((ctx) => {
      const t = ctx.target?.kind === 'minion' ? findMinion(ctx.g, ctx.target.instanceId)?.minion : undefined;
      return buff(self(), t?.attack ?? 0, t?.health ?? 0);
    }),
    destroy(chosenTarget()),
  ],
}));
