import { defineCard } from '../define-card';
import {
  buffWeaponStats,
  computed,
  equipTokenWeapon,
} from '../../effects/primitives';

const WEAPON_BONUS = 1;
const PRACTICE_BLADE = 'PRIME_236a';

// PRIME_236 spell: "If you have a weapon, give it +1/+1. Otherwise equip a 1/3
// weapon" (the 1/3 weapon is the token PRIME_236a)
export default defineCard('PRIME_236', () => ({
  onPlay: [
    computed((ctx) =>
      ctx.g.players[ctx.caster].weapon
        ? buffWeaponStats(WEAPON_BONUS, WEAPON_BONUS)
        : equipTokenWeapon(PRACTICE_BLADE),
    ),
  ],
}));
