import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

const LOW_HEALTH = 12;
const BASE_DAMAGE = 4;
const LOW_HEALTH_DAMAGE = 6;

// PRIME_240 spell: "Deal 4 damage. If you have 12 or less Health, deal 6
// instead." Read as aimed at any character (RULES Appendix B).
export default defineCard('PRIME_240', () => ({
  target: anyCharacter(),
  onPlay: [
    computed((ctx) => {
      const isLow = ctx.g.players[ctx.caster].health <= LOW_HEALTH;

      return damage(chosenTarget(), isLow ? LOW_HEALTH_DAMAGE : BASE_DAMAGE);
    }),
  ],
}));
