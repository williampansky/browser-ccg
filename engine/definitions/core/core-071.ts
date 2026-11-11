import { defineCard, on } from '../define-card';
import { disable } from '../../effects/primitives';
import { eventTarget } from '../../effects/selectors';

// CORE_071 Ice Primordial: "Disable anyone attacked by this minion" (a hero too: it cannot attack with its weapon next turn)
export default defineCard('CORE_071', () => ({
  triggers: [
    on('MinionAttacked', {
      when: (e, c) => e.attackerId === c.selfId,
      do: [disable(eventTarget())],
    }),
  ],
}));
