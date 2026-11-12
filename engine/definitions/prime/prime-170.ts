import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { allMinions } from '../../effects/selectors';

// PRIME_170 Holy Light: "Heal 4 Health to ALL minions"
export default defineCard('PRIME_170', (n) => ({ onPlay: [heal(allMinions(), n.primary)] }));
