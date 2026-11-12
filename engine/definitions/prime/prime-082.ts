import { defineCard } from '../define-card';
import { destroy } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_082 Foxy Huntsman (4/3), warcry: "Destroy a minion with 6+ Attack that is damaged or has attacked this turn" (either side)
export default defineCard('PRIME_082', () => ({
  target: minionWhere('any', (m) => m.attack >= 6 && (m.health < m.maxHealth || m.attacksThisTurn > 0)),
  onPlay: [destroy(chosenTarget())],
}));
