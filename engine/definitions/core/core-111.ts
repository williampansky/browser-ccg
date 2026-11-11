import { defineCard } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { friendlyMinions } from '../../effects/selectors';

// CORE_111 spell: "Boon: Give all your minions +3 Attack power" (for this turn)
export default defineCard('CORE_111', (n) => ({
  onPlay: [buffThisTurn(friendlyMinions(), n.primary)],
}));
