import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_217 Darksoul, warcry: "Deal 3 damage to your player's hero"
export default defineCard('PRIME_217', (n) => ({ onPlay: [damage(ownHero(), n.primary)] }));
