import { defineCard } from '../define-card';
import { buff, grantKeyword } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_059 warcry: "Buff a Creature with Guard and +1/+2" (a friendly Creature, as in hsclone)
export default defineCard('CORE_059', (n) => ({
  target: minionWhere('friendly', (_m, race) => race === 'CREATURE'),
  onPlay: [buff(chosenTarget(), n.primary, n.secondary), grantKeyword(chosenTarget(), 'guard')],
}));
