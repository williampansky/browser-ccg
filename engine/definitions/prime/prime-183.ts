import { defineCard } from '../define-card';
import { loanMinion } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_183 Data-Mage, warcry: "Take control of an enemy minion with 2 or less Attack for 2 turns" (until the end of your next turn; it cannot attack this turn)
export default defineCard('PRIME_183', () => ({
  target: minionWhere('enemy', (m) => m.attack <= 2),
  onPlay: [loanMinion(chosenTarget(), 2, false)],
}));
