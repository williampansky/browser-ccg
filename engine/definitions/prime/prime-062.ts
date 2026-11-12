import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_062 Crumbling Golem, warcry: "Take 4 damage" (your hero takes it; a 5/8 for 3 that costs you life)
export default defineCard('PRIME_062', (n) => ({ onPlay: [damage(ownHero(), n.primary)] }));
