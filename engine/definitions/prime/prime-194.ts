import { defineCard } from '../define-card';
import { computed, damage } from '../../effects/primitives';
import { allEnemies } from '../../effects/selectors';
import type { Effect } from '../../effects/types';

const destroyOwnWeapon: Effect = (ctx) => {
  ctx.g.players[ctx.caster].weapon = null;
  ctx.events.push({ type: 'WeaponBroke', player: ctx.caster });
};

// PRIME_194 Ignition: "Destroy your weapon and deal its Attack to all enemies" (their minions and hero; nothing happens without a weapon)
export default defineCard('PRIME_194', () => ({
  onPlay: [
    computed((ctx) => {
      const w = ctx.g.players[ctx.caster].weapon;
      return w ? (c) => (damage(allEnemies(), w.attack)(c), destroyOwnWeapon(c)) : () => undefined;
    }),
  ],
}));
