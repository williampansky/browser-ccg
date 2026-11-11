import { defineCard } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// CORE_012 Sprite Support, warcry: "Summon a 1/1 Sprite companion" (its entourage token)
export default defineCard('CORE_012', () => ({ onPlay: [summonEntourage()] }));
