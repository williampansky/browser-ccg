import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_097 Aharon, Medjai of the Desert, Demise: "Summon Ata"
export default defineCard('PRIME_097', () => ({ onDeath: [summonEntourage()] }));
