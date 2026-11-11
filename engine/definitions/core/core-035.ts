import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { enemyHero } from '../../effects/selectors';

// CORE_035 Red-eyed Killer, warcry: "Attack the enemy hero for 3 damage"
export default defineCard('CORE_035', (n) => ({ onPlay: [damage(enemyHero(), n.primary)] }));
