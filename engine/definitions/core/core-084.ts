import { defineCard } from '../define-card';
import { obtainOpponentPlayedCard } from '../../effects/primitives';

// CORE_084 item: "Obtain a Random card your opponent has already played"
export default defineCard('CORE_084', () => ({
  onPlay: [obtainOpponentPlayedCard()],
}));
