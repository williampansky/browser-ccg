import { defineCard } from '../define-card';
import { grantResurrection } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// PRIME_206: "Give a minion: On Death: Resurrect". Aimed at one of your own
// minions, since the copy that comes back belongs to the minion's owner.
export default defineCard('PRIME_206', () => ({
  target: friendlyMinion(),
  onPlay: [grantResurrection(chosenTarget())],
}));
