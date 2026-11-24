import { defineCard } from '../define-card';
import { damage, returnThisCardNextTurn } from '../../effects/primitives';
import { enemyHero } from '../../effects/selectors';

const DAMAGE = 2;

// PRIME_191: "Deal 2 damage to the enemy hero. Combo: Return this to your hand
// next turn." The Combo part comes back at the start of your next turn.
export default defineCard('PRIME_191', () => ({
  onPlay: [damage(enemyHero(), DAMAGE)],
  combo: { effects: [returnThisCardNextTurn()] },
}));
