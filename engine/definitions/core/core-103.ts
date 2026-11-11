import { defineCard } from '../define-card';
import { healToFull, grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_103 item: "Restore and Buff a minion with Guard" (a friendly minion: full health and Guard)
export default defineCard('CORE_103', () => ({
  target: friendlyMinion(),
  onPlay: [healToFull(chosenTarget()), grantKeyword(chosenTarget(), 'guard')],
}));
