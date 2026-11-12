import { defineCard } from '../define-card';
import { damage, heal } from '../../effects/primitives';
import { chosenTarget, ownHero } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_180 Plague Doctor: "Deal 5 damage, and Heal yourself for 5"
export default defineCard('PRIME_180', (n) => ({
  target: anyCharacter(),
  onPlay: [damage(chosenTarget(), n.primary), heal(ownHero(), n.primary)],
}));
