import { defineCard, on } from '../define-card';
import { summonEntourage } from '../../effects/primitives';

// PRIME_098 Spirit of the Forest: "At the end of your turn, summon a 2/2 Sprite with Guard" (Guardian of SummerHall, PRIME_098a)
export default defineCard('PRIME_098', () => ({
  triggers: [on('TurnEnded', { when: (e, c) => e.player === c.owner, do: [summonEntourage()] })],
}));
