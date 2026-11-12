import { defineCard } from '../define-card';
import { summonEntourageForOpponent } from '../../effects/primitives';

// PRIME_096 Parker Paddington: "Stampede. Summon two 1/1 Creatures for your opponent"
export default defineCard('PRIME_096', () => ({ onPlay: [summonEntourageForOpponent(0, 2)] }));
