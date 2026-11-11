import { defineCard } from '../define-card';
import { setAttack } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_075 spell: "Debuff a minion's Attack power to 1" (hsclone set health; text wins)
export default defineCard('CORE_075', (n) => ({
  target: anyMinion(),
  onPlay: [setAttack(chosenTarget(), n.primary)],
}));
