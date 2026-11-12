import { defineCard } from '../define-card';
import { summonRandomCard } from '../../effects/primitives';

// PRIME_084 Serene Valley: "Can't Attack / Guard. Demise: Summon a Random Creature" (any playable Creature minion card)
export default defineCard('PRIME_084', () => ({ onDeath: [summonRandomCard((c) => c.race === 'CREATURE')] }));
