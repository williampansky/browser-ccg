import { defineCard, on } from '../define-card';
import { addRandomCardToHand } from '../../effects/primitives';

// PRIME_154 Amaad the Shaper: "Whenever you play a card, add a Random card to your hand; it costs (4) less" (any card from hand, a Mystery or weapon too; not itself)
export default defineCard('PRIME_154', (n) => {
  const gift = [addRandomCardToHand(() => true, 1, -n.primary)];
  return {
    triggers: [
      on('CardPlayed', { when: (e, c) => e.player === c.owner, do: gift }),
      on('MinionPlayed', { when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId, do: gift }),
      on('WeaponEquipped', { when: (e, c) => e.player === c.owner, do: gift }),
    ],
  };
});
