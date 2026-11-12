import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_208: "Deal N damage to a character; Overcharge" (the lock is applied in play-card.ts)
export default defineCard('PRIME_208', (n) => ({ target: anyCharacter(), onPlay: [damage(chosenTarget(), n.primary)] }));
