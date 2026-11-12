import { defineCard } from '../define-card';
import { stealEnemyMystery } from '../../effects/primitives';

// PRIME_067 Android Infiltrator, warcry: "Take the enemy's Mystery" (it stays face down; destroyed instead if you already have one)
export default defineCard('PRIME_067', () => ({ onPlay: [stealEnemyMystery()] }));
