import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_107: "Buff with Double Attack" (two attacks per turn)
export default defineCard('CORE_107', () => ({
  target: anyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'doubleAttack')],
}));
