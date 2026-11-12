import { defineCard } from '../define-card';
import { damage, heal } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_017 Feline Fisherman, Select One: "Heal a character 3; or deal 1 damage to a character"
export default defineCard('PRIME_017', () => ({
  choices: [
    { label: 'Heal a character 3', target: anyCharacter(), onPlay: [heal(chosenTarget(), 3)] },
    { label: 'Deal 1 damage to a character', target: anyCharacter(), onPlay: [damage(chosenTarget(), 1)] },
  ],
}));
