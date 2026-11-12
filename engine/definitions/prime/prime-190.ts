import { defineCard } from '../define-card';
import { randomDamage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_190 Slash: "Deal 2-4 Random damage" (to a character you choose)
export default defineCard('PRIME_190', (n) => ({ target: anyCharacter(), onPlay: [randomDamage(chosenTarget(), n.primary, n.secondary)] }));
