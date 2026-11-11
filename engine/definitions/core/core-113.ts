import { defineCard } from '../define-card';
import { sacrificeFor } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// CORE_113 spell: "Gain 5 HP by sacrificing one of your Undead (Demonic) minions"
export default defineCard('CORE_113', (n) => ({
  target: minionWhere('friendly', (_m, race) => race === 'DEMONIC'),
  onPlay: [sacrificeFor(chosenTarget(), n.primary)],
}));
