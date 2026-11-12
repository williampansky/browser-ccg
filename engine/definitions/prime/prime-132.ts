import { defineCard } from '../define-card';
import { destroyEnemyMystery, draw, revealHidden } from '../../effects/primitives';

// PRIME_132 Light the Dark (a spell, not a Mystery): "Reveal all Concealed minions (they lose it and take 1 damage). Destroy the enemy's Mystery and draw a card if you did"
export default defineCard('PRIME_132', () => ({ onPlay: [revealHidden(), destroyEnemyMystery(draw(1))] }));
