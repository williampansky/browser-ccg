import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_019 Phatcat Warrior, Demise: "Summon a 2/1 Warrior Bot"
export default defineCard('PRIME_019', () => ({ onDeath: [summonEntourage()] }));
