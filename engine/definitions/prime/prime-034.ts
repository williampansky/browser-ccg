import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_034 Warpig Knight, warcry: "Summon a 2/2 Warpig Mercenary"
export default defineCard('PRIME_034', () => ({ onPlay: [summonEntourage()] }));
