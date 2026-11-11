import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_074: "Give a minion Bubble"
export default defineCard('CORE_074', () => ({
  target: anyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'bubble')],
}));
