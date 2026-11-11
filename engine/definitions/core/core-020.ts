import { defineCard } from '../define-card';
import { summonRandomEntourage } from '../../effects/primitives';

// CORE_020 warcry: "Summon a 1/1 Creature" (one of its two 1/1 tokens, at random)
export default defineCard('CORE_020', () => ({
  onPlay: [summonRandomEntourage()],
}));
