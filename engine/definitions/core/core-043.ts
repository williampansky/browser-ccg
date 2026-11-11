import { defineCard } from '../define-card';
import { gainEnergy } from '../../effects/primitives';

// CORE_043: "Obtain 1 extra energy for this turn only"
export default defineCard('CORE_043', (n) => ({ onPlay: [gainEnergy(n.primary)] }));
