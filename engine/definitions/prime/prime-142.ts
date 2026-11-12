import { defineCard, on } from '../define-card';
import { damage } from '../../effects/primitives';
import { ownHero } from '../../effects/selectors';

// PRIME_142 Demon Sorcerer: "Your spell cards cost 1 less. Your hero takes 1 damage when you cast one" (spells only, not items)
export default defineCard('PRIME_142', () => ({
  costMods: [{ affects: (card) => card.type === 'spell', delta: -1 }],
  triggers: [
    on('CardPlayed', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.type === 'spell',
      do: [damage(ownHero(), 1)],
    }),
  ],
}));
