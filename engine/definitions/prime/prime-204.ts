import { defineCard } from '../define-card';
import { disable } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';

// PRIME_204 Frosted Sword: "Disables the enemy it hits. Overcharge (1)" (a minion, or the hero, which then cannot swing next turn)
export default defineCard('PRIME_204', () => ({ beforeAttack: [disable(chosenTarget())] }));
