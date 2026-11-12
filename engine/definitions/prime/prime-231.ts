import { defineCard } from '../define-card';
import { computed, draw } from '../../effects/primitives';
import { MAX_HEALTH } from '../../state/types';

// PRIME_231 Peace Keeping: "Draw card(s) for each injured friendly character" (your hero counts; one card each)
export default defineCard('PRIME_231', (n) => ({
  onPlay: [
    computed((ctx) => {
      const me = ctx.g.players[ctx.caster];
      const injured = me.board.filter((m) => m.health < m.maxHealth).length + (me.health < MAX_HEALTH ? 1 : 0);
      return draw(injured * n.primary);
    }),
  ],
}));
