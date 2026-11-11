import { defineCard } from '../define-card';
import { addArmor, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_045 spell, "Select One: Deal 1 damage or gain +1 Armor"
export default defineCard('CORE_045', (n) => ({
  choices: [
    { label: `Deal ${n.primary} damage`, target: anyCharacter(), onPlay: [damage(chosenTarget(), n.primary)] },
    { label: `Gain ${n.primary} Armor`, onPlay: [addArmor(n.primary)] },
  ],
}));
