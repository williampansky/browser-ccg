import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_123 item: "Give a minion Stampede. Allows for immediate attack" (a friendly minion)
export default defineCard('CORE_123', () => ({
  target: friendlyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'rush')],
}));
