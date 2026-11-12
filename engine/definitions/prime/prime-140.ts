import { defineCard } from '../define-card';
import { addRandomCardToHand } from '../../effects/primitives';

// PRIME_140 Tome of Spells (item): "Add a Random spell that costs 3 or less to your hand" (a playable CORE or PRIME spell)
export default defineCard('PRIME_140', (n) => ({ onPlay: [addRandomCardToHand((c) => c.type === 'spell' && c.cost <= n.primary)] }));
