import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_034, On Play effect: "Summon a 2/2 Minotaur Recruit"
export default defineCard('PRIME_034', () => ({ onPlay: [summonEntourage()] }));
