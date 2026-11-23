import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_255 Smash! (Warrior only): "Deal 1 damage for each Armor you have
// (cannot be used on heroes)". Armor is not spent.
export default defineCard('PRIME_255', (n) => ({
  target: anyMinion(),
  onPlay: [
    computed((ctx) =>
      damage(
        chosenTarget(),
        (n.primary ?? 1) * ctx.g.players[ctx.caster].armor,
      ),
    ),
  ],
}));
