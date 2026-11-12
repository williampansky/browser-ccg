import { defineCard, on } from '../define-card';
import { destroy } from '../../effects/primitives';
import { randomEnemyMinions } from '../../effects/selectors';

// PRIME_249 Hell Executioner: "Whenever you play a card, destroy a Random enemy minion" (any card from hand, a Mystery included; not itself)
export default defineCard('PRIME_249', () => {
  const kill = [destroy(randomEnemyMinions(1))];
  return {
    triggers: [
      on('CardPlayed', { when: (e, c) => e.player === c.owner, do: kill }),
      on('MinionPlayed', { when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId, do: kill }),
      on('WeaponEquipped', { when: (e, c) => e.player === c.owner, do: kill }),
    ],
  };
});
