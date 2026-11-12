import { defineCard } from '../define-card';
import { damage } from '../../effects/primitives';
import { allEnemyMinions, chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// PRIME_120 Shamanic Rage: "Select One: Deal 5 damage, or 2 to all enemy minions"
export default defineCard('PRIME_120', () => ({
  choices: [
    { label: 'Deal 5 damage', target: anyCharacter(), onPlay: [damage(chosenTarget(), 5)] },
    { label: 'Deal 2 damage to all enemy minions', onPlay: [damage(allEnemyMinions(), 2)] },
  ],
}));
