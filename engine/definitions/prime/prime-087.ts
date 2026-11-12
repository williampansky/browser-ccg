import { defineCard } from '../define-card';
import { draw } from '../../effects/primitives';

// PRIME_087 Medjai of Donarini: "+1 Spell Damage. Demise: Draw a card"
export default defineCard('PRIME_087', (n) => ({ spellDamage: n.primary, onDeath: [draw(1)] }));
