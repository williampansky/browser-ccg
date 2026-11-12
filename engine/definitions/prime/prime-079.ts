import { defineCard } from '../define-card';
import { buff, computed } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_079 Catspurly Ghost, warcry: "Destroy all Bubbles; gain +3/+3 for each" (every other minion, either side)
export default defineCard('PRIME_079', () => ({
  onPlay: [
    computed((ctx) => {
      let popped = 0;
      for (const p of ['0', '1'] as const) {
        for (const m of ctx.g.players[p].board) {
          if (m.instanceId !== ctx.self && m.keywords.bubble) {
            m.keywords.bubble = false;
            popped++;
          }
        }
      }
      return buff(self(), 3 * popped, 3 * popped);
    }),
  ],
}));
