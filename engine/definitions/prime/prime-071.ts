import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { randomEnemyMinionsWhere } from '../../effects/selectors';

// PRIME_071 To-ku Swallower, warcry: "Destroy a Random enemy minion with 2 or less Attack"
export default defineCard('PRIME_071', () => ({ onPlay: [destroy(randomEnemyMinionsWhere(1, (m) => m.attack <= 2))] }));
