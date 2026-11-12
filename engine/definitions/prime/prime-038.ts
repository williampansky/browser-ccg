import { defineCard } from '../define-card';
import { disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_038 Insectoid Chomper, warcry: "Disable a character"
export default defineCard('PRIME_038', () => ({ target: anyCharacter(), onPlay: [disable(chosenTarget())] }));
