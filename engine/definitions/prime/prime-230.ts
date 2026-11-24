import { defineCard } from '../define-card';
import { buff, damage } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

const ATTACK_BONUS = 2;
const NO_HEALTH_BONUS = 0;
const DAMAGE = 1;

// PRIME_230 spell: "Deal 1 damage to a minion and give it +2 Attack"
export default defineCard('PRIME_230', () => ({
  target: anyMinion(),
  onPlay: [
    damage(chosenTarget(), DAMAGE),
    buff(chosenTarget(), ATTACK_BONUS, NO_HEALTH_BONUS),
  ],
}));
