import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// CORE_064 spell: "Summon a pair of 0/2 minions with Guard"
export default defineCard('CORE_064', () => ({
  onPlay: [summonEntourage(), summonEntourage()],
}));
