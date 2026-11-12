import { defineCard } from '../define-card';
import { setHeroHealth } from '../../effects/primitives';
import type { Selector } from '../../effects/types';

const bothHeroes: Selector = () => [
  { kind: 'hero', player: '0' },
  { kind: 'hero', player: '1' },
];

// PRIME_105 Nightmare, warcry: "Set both heroes' Health to 18"
export default defineCard('PRIME_105', (n) => ({ onPlay: [setHeroHealth(bothHeroes, n.primary)] }));
