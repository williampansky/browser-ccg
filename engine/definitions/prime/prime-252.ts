import { defineCard } from '../define-card';
import { forceAllAttack, summonEntourage } from '../../effects/primitives';

// PRIME_252 War and Ruin: "Force ALL other minions to attack Random characters. Demise: Summon Ruin" (each picks a random enemy character, in play order)
export default defineCard('PRIME_252', () => ({ onPlay: [forceAllAttack()], onDeath: [summonEntourage()] }));
