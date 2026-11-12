import { defineCard } from '../define-card';
import { heal } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_039 Starborne Healer, warcry: "Heal your player for 5 Health"
export default defineCard('PRIME_039', (n) => ({ onPlay: [heal(ownHero(), n.primary)] }));
