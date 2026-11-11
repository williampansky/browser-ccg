import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// CORE_025 warcry: "Summon a 2/1 Android"
export default defineCard('CORE_025', () => ({
  onPlay: [summonEntourage()],
}));
