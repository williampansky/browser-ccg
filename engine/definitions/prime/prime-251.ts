import { defineCard } from '../define-card';
import { steal, summonEntourage } from '../../effects/primitives';
import { randomEnemyMinions } from '../../effects/selectors';

// PRIME_251 Conquest and Glory: "Steal 2 Random minions. Demise: Summon Glory"
export default defineCard('PRIME_251', (n) => ({ onPlay: [steal(randomEnemyMinions(n.random))], onDeath: [summonEntourage()] }));
