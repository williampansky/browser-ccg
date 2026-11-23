import { defineCard, on } from '../define-card';
import { heal } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

const SPRING_HEAL = 1;

// HERO_MYSTIC_SPRING (Spring Totem, a token of the Mystic's skill): heals
// the owner's minions at the end of their turn
export default defineCard('HERO_MYSTIC_SPRING', () => ({
  triggers: [
    on('TurnEnded', {
      when: (e, c) => e.player === c.owner,
      do: [heal(friendlyMinions(), SPRING_HEAL)],
    }),
  ],
}));
