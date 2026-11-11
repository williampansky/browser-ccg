import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// CORE_110 warcry: "Give a minion Onslaught"
export default defineCard('CORE_110', () => ({
  target: anyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'doubleAttack')],
}));
