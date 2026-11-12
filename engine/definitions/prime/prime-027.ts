import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_027 Soul Collector: "Whenever a minions dies, draw a card" (any minion, either side; not itself)
export default defineCard('PRIME_027', () => ({ triggers: [on('MinionDied', { do: [draw(1)] })] }));
