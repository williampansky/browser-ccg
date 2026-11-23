import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// GAME_006 Spring Totem (a token of the Mystic's skill): "At the end of your
// turn, heal your minions %NUM1%"
export default defineCard('GAME_006', (n) => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner,
      do: [heal(friendlyMinions(), n.primary)],
    }),
  ],
}));
