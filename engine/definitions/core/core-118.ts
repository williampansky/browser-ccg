import { defineCard } from '../define-card';
import { discardRandom } from '../../effects/primitives';

// CORE_118 warcry: "Discard a random card"
export default defineCard('CORE_118', () => ({
  onPlay: [discardRandom()],
}));
