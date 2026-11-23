import { defineCard } from '../define-card';
import { buff } from '../../effects/primitives';
import { friendlyOfRace } from '../../effects/selectors';

const NO_ATTACK_BONUS = 0;

// PRIME_258 spell: "Buff your Idol minions with +2 Health" (the Mystic's totems)
export default defineCard('PRIME_258', (n) => ({
  onPlay: [buff(friendlyOfRace('IDOL'), NO_ATTACK_BONUS, n.primary)],
}));
