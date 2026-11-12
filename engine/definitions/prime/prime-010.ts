import { defineCard } from '../define-card';
import { buff, computed } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_010 Demogod, warcry: "Gain Attack equal to that of your weapon" (nothing without a weapon)
export default defineCard('PRIME_010', () => ({
  onPlay: [computed((ctx) => buff(self(), ctx.g.players[ctx.caster].weapon?.attack ?? 0, 0))],
}));
