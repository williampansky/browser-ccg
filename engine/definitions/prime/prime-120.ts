import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { allEnemyMinions, chosenTarget, neighboursOfTarget } from '../../effects/selectors';
import { anyMinion } from '../../effects/filters';

// PRIME_120 Shamanic Rage, Select One: "4 damage to a minion and 1 to its neighbours; or 1 to all enemy minions and Disable them"
export default defineCard('PRIME_120', () => ({
  choices: [
    {
      label: '4 damage to a minion, 1 to its neighbours',
      target: anyMinion(),
      onPlay: [damage(neighboursOfTarget(), 1), damage(chosenTarget(), 4)],
    },
    { label: '1 damage to all enemy minions and Disable them', onPlay: [damage(allEnemyMinions(), 1), disable(allEnemyMinions())] },
  ],
}));
