import { defineCard } from '../define-card';
import { drawDiscounted } from '../../effects/primitives';

// PRIME_211 Warpipe: "Draw a card; it costs 3 less to play"
export default defineCard('PRIME_211', (n) => ({ onPlay: [drawDiscounted(1, -n.primary)] }));
