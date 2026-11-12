import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_250: "If you have an active Mystery at the end of your turn, Buff +2/+4"
export default defineCard('PRIME_250', () => ({
  triggers: [
    on('TurnEnded', { when: (e, c) => e.player === c.owner && !!c.state.players[c.owner].mystery, do: [buff(self(), 2, 4)] }),
  ],
}));
