import { defineCard, on } from '../define-card';
import { damage, summonEntourage } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_061 Ice Hut: "At the end of your turn, take 1 damage and Summon a 1/1 Ice Fish" (the hut itself takes the damage)
export default defineCard('PRIME_061', () => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [damage(self(), 1), summonEntourage()] })],
}));
