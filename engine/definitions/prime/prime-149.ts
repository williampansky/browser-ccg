import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_149: "If you have an active Mystery at the end of your turn, Buff +1/+2"
export default defineCard('PRIME_149', () => ({
  triggers: [
    on('TurnEnded', { when: (e, c) => e.player === c.owner && !!c.state.players[c.owner].mystery, do: [buff(self(), 1, 2)] }),
  ],
}));
