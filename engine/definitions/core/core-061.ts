import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_061 Ancient Raptor: "Draw a card anytime you summon a Creature"
// ("summon" covers playing one from hand too; the raptor does not trigger on itself.)
export default defineCard('CORE_061', () => ({
  triggers: [
    on('MinionSummoned', {
      when: (e, c) => e.player === c.owner && e.instanceId !== c.selfId && c.catalog.get(e.cardId)?.race === 'CREATURE',
      do: [draw(1)],
    }),
  ],
}));
