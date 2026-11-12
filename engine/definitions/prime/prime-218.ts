import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_218 Triton Sorcery: "Buff a friendly minion with +2/+2"
export default defineCard('PRIME_218', (n) => ({
  target: friendlyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.primary)],
}));
