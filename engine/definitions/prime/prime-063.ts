import { defineCard } from '../define-card';
import { loanMinion } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_063 Seadog Captain, warcry: "Take control of an enemy minion with 2 or less Attack until the end of this turn" (it can attack)
export default defineCard('PRIME_063', () => ({
  target: minionWhere('enemy', (m) => m.attack <= 2),
  onPlay: [loanMinion(chosenTarget(), 1, true)],
}));
