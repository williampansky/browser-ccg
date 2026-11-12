import { defineCard } from '../define-card';
import { summonEntourageForOpponent } from '../../effects/primitives';

// PRIME_100 Sellarus: "Demise: Summon a 3/3 Creature for your opponent" (PRIME_100a)
export default defineCard('PRIME_100', () => ({ onDeath: [summonEntourageForOpponent()] }));
