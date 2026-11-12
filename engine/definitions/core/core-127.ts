import { defineCard } from '../define-card';
import { buffWeaponThisTurn, equipWeapon } from '../../effects/primitives';
import type { Effect } from '../../effects/types';

// CORE_127 item: "Boon: Gain +4 Attack". With a weapon already equipped, add +4 Attack to it for this turn only (a boon,
// not a permanent buff: playtest 2026-11-12); otherwise equip a 4/1 weapon for this turn only.
const equipOrBuff: Effect = (ctx) =>
  (ctx.g.players[ctx.caster].weapon ? buffWeaponThisTurn(4) : equipWeapon({ temporary: true }))(ctx);

export default defineCard('CORE_127', () => ({
  onPlay: [equipOrBuff],
}));
