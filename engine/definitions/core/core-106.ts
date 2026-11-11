import { defineCard } from '../define-card';
import { buffThisTurn } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_106 spell: "Give a friendly minion +3 Attack for one turn" (hsclone made it permanent; text wins)
export default defineCard('CORE_106', (n) => ({
  target: friendlyMinion(),
  onPlay: [buffThisTurn(chosenTarget(), n.primary)],
}));
