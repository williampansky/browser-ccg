import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

const ATTACK = 2;
const COMBO_ATTACK = 4;

// PRIME_188: "Give a minion +2 Attack. Combo: +4 Attack instead."
export default defineCard('PRIME_188', () => ({
  target: anyMinion(),
  onPlay: [buff(chosenTarget(), ATTACK, 0)],
  combo: { effects: [buff(chosenTarget(), COMBO_ATTACK, 0)], instead: true },
}));
