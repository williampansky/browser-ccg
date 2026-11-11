import { defineCard } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// CORE_048 spell: "+2 Attack this turn for all friendlies" (your minions)
export default defineCard('CORE_048', (n) => ({
  onPlay: [buffThisTurn(friendlyMinions(), n.primary)],
}));
