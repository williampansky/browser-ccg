import { defineCard, on } from '../define-card';
import { destroy } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_200 Molten Golem: "Onslaught. Dies at the end of your turn if it attacked twice. Overcharge (1)"
export default defineCard('PRIME_200', () => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner && (c.state.players[c.owner].board.find((m) => m.instanceId === c.selfId)?.attacksThisTurn ?? 0) >= 2,
      do: [destroy(self())],
    }),
  ],
}));
