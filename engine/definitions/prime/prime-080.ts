import { defineCard, on } from '../define-card';
import { buffThisTurn, grantKeyword } from '../../effects/primitives';
import { eventMinion } from '../../effects/selectors';

// PRIME_080 Brave Sprite: "Whenever you summon a Sprite, give it +2 Attack this turn and Rush" (not for itself)
export default defineCard('PRIME_080', () => ({
  triggers: [
    on('MinionSummoned', {
      when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId && c.catalog.get(e.cardId)?.race === 'SPRITE',
      do: [buffThisTurn(eventMinion(), 2), grantKeyword(eventMinion(), 'rush')],
    }),
  ],
}));
