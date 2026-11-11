import { defineCard } from '../define-card';
import { disable } from '../../effects/primitives';
import { allEnemyMinions } from '../../effects/selectors';

// CORE_068: "Disable every enemy minion"
export default defineCard('CORE_068', () => ({ onPlay: [disable(allEnemyMinions())] }));
