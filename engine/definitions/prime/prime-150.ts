import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// PRIME_150 Firefall: "Deal 2 damage to all enemy minions and Disable them" (survivors are disabled)
export default defineCard('PRIME_150', (n) => ({ onPlay: [damage(allEnemyMinions(), n.primary), disable(allEnemyMinions())] }));
