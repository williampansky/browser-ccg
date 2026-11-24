import { defineCard } from '../define-card';
import { computed, summonEntourage } from '../../effects/primitives';
import { opponentOf } from '../../rules/lookup';

const HOUND = 'GAME_010';

// PRIME_131 spell: "For each enemy minion, summon a 1/1 Hound with Rush" (the
// token is GAME_010; the count is taken when the spell is cast, and a full
// board stops the summoning)
export default defineCard('PRIME_131', () => ({
  onPlay: [
    computed((ctx) => {
      const foes = ctx.g.players[opponentOf(ctx.caster)].board.length;

      return (inner) => {
        for (let i = 0; i < foes; i++) summonEntourage(HOUND)(inner);
      };
    }),
  ],
}));
