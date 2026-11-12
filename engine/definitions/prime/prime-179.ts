import { defineCard } from '../define-card';
import { loanMinion } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { minionWhere } from '../../effects/filters';

// PRIME_179 Malevolent Cephalopod: "Gain control of an enemy minion with 3 or less Attack until the end of this turn; it can attack"
export default defineCard('PRIME_179', () => ({
  target: minionWhere('enemy', (m) => m.attack <= 3),
  onPlay: [loanMinion(chosenTarget(), 1, true)],
}));
