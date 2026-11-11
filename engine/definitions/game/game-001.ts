import { defineCard } from '../define-card';
import { gainEnergy } from '../../effects/primitives';

// GAME_001 The Orb: "Gain 1 energy for this turn only" (second player's bonus card)
export default defineCard('GAME_001', (n) => ({ onPlay: [gainEnergy(n.primary)] }));
