import { defineCard, on } from '../define-card';
import { draw } from '../../effects/primitives';

// CORE_085 Ifriit Ward: "Draw a card whenever a minion is healed" (either side's minion)
export default defineCard('CORE_085', (n) => ({
  triggers: [on('Healed', { when: (e) => e.target.kind === 'minion', do: [draw(n.primary)] })],
}));
