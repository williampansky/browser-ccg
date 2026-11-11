import { defineCard } from '../define-card';
import { summonRandomEntourage } from '../../effects/primitives';

// CORE_057 spell: "Summon a Random backup minion" (the token's own warcry does not run: summoned minions have none)
export default defineCard('CORE_057', () => ({
  onPlay: [summonRandomEntourage()],
}));
