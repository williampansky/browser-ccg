import { defineCard } from '../define-card';
import { grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_099 warcry: "Buff a minion w/Onslaught" (a friendly minion, as in hsclone)
export default defineCard('CORE_099', () => ({
  target: friendlyMinion(),
  onPlay: [grantKeyword(chosenTarget(), 'doubleAttack')],
}));
