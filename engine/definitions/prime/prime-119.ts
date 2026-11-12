import { defineCard } from '../define-card';
import { damage, reduceAttack, silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyMinion, minionWhere } from '../../effects/filters';

// PRIME_119 Maven of Lost Souls, Select One: "2 damage to a damaged minion; or Suppress a minion and give it -1 Attack"
export default defineCard('PRIME_119', () => ({
  choices: [
    { label: '2 damage to a damaged minion', target: minionWhere('any', (m) => m.health < m.maxHealth), onPlay: [damage(chosenTarget(), 2)] },
    { label: 'Suppress a minion and give it -1 Attack', target: anyMinion(), onPlay: [silence(chosenTarget()), reduceAttack(chosenTarget(), 1)] },
  ],
}));
