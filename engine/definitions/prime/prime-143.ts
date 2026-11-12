import { defineCard } from '../define-card';
import { addArmor, computed } from '../../effects/primitives';

// PRIME_143 Commissioned Armor, Mystery (Attack): "When your hero is attacked, gain Armor equal to twice the attacker's Attack (min 4)"
export default defineCard('PRIME_143', () => ({
  mystery: {
    category: 'attack',
    hook: 'attack',
    when: ({ attack, owner }) => attack?.attackerId !== undefined && attack.target.kind === 'hero' && attack.target.player === owner,
    do: [
      computed((ctx) => {
        const a = ctx.g.players[ctx.attack!.attackerPlayer].board.find((m) => m.instanceId === ctx.attack!.attackerId);
        return addArmor(Math.max(4, 2 * (a?.attack ?? 0)));
      }),
    ],
  },
}));
