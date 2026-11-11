import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { friendlyMinion } from '../../effects/filters';

// CORE_059 warcry: "Buff a Creature with Guard and +1/+2": any friendly minion (the author's call after playtesting; hsclone allowed only Creatures)
export default defineCard('CORE_059', (n) => ({
  target: friendlyMinion(),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary), grantKeyword(chosenTarget(), 'guard')],
}));
