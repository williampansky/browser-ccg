import { defineCard } from '../define-card';
import { destroy, discardRandom } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';
import type { Selector } from '../../effects/types';
import { MAX_HAND } from '../../state/types';

const otherMinions: Selector = (ctx) =>
  allMinions()(ctx).filter(
    (target) => target.kind === 'minion' && target.instanceId !== ctx.self,
  );

// PRIME_110 On Play: "Destroy all other minions and discard your hand" (the
// whole hand: the most a hand can hold)
export default defineCard('PRIME_110', () => ({
  onPlay: [destroy(otherMinions), discardRandom(MAX_HAND)],
}));
