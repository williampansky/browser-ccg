import { defineCard, on } from '../define-card';
import { buff } from '../../effects/primitives';
import { self } from '../../effects/selectors';

// PRIME_128 Bottomfeeder Crab: "Gain +2/+1 whenever a friendly Creature dies"
export default defineCard('PRIME_128', () => ({
  triggers: [
    on('MinionDied', {
      when: (e, c) => e.player === c.owner && c.catalog.get(e.cardId)?.race === 'CREATURE',
      do: [buff(self(), 2, 1)],
    }),
  ],
}));
