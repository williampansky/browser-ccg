import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_136 Primal Hunter, Demise: "Summon two 2/2 Creatures" (two Primal Beasts, PRIME_136a)
export default defineCard('PRIME_136', () => ({ onDeath: [summonEntourage(), summonEntourage()] }));
