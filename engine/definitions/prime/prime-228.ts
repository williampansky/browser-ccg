import { defineCard } from '../define-card';
import { destroy, draw } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';
import type { Effect } from '../../effects/types';

/** Both players draw a card (the caster first). */
const bothDraw: Effect = (ctx) => {
  draw(1)(ctx);
  draw(1)({ ...ctx, caster: ctx.caster === '0' ? '1' : '0' });
};

// PRIME_228 The Sorcerer's Stone (6): "Destroy all minions with 4 or more Attack, then both players draw a card"
export default defineCard('PRIME_228', () => ({
  onPlay: [(ctx) => destroy((c) => allMinions()(c).filter((t) => t.kind === 'minion' && [...c.g.players['0'].board, ...c.g.players['1'].board].find((m) => m.instanceId === t.instanceId)!.attack >= 4))(ctx), bothDraw],
}));
