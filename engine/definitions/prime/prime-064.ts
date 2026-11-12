import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_064 Cultist Acolyte: "Gain +1/+1 for every card your opponent plays" (any card from their hand: a minion, spell, item, weapon or Mystery)
export default defineCard('PRIME_064', () => {
  const grow = [buff(self(), 1, 1)];
  return {
    triggers: [
      on('CardPlayed', { when: (e, c) => e.player !== c.owner, do: grow }),
      on('MinionPlayed', { when: (e, c) => e.player !== c.owner, do: grow }),
      on('WeaponEquipped', { when: (e, c) => e.player !== c.owner, do: grow }),
    ],
  };
});
