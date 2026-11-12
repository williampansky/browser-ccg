import { defineCard } from '../define-card';
import { addArmor, computed, destroyEnemyWeapon } from '../../effects/primitives';
import { opponentOf } from '../../rules/lookup';

// PRIME_095 The Inquisitor (4/5), warcry: "Destroy the enemy's weapon and gain its Attack as Armor"
export default defineCard('PRIME_095', () => ({
  onPlay: [computed((ctx) => addArmor(ctx.g.players[opponentOf(ctx.caster)].weapon?.attack ?? 0)), destroyEnemyWeapon()],
}));
