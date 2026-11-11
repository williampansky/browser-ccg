import { defineCard } from '../define-card';
import { gainEnergySlot } from '../../effects/primitives';

// CORE_049 item: "Obtain an empty Action Point"
export default defineCard('CORE_049', () => ({
  onPlay: [gainEnergySlot()],
}));
