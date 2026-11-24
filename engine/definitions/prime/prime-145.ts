import { defineCard } from '../define-card';
import { damage, disable } from '../../effects/primitives';
import { chosenTarget, neighboursOfTarget } from '../../effects/selectors';
import type { Selector } from '../../effects/types';
import { anyMinion } from '../../effects/filters';

const targetAndNeighbours: Selector = (ctx) => [
  ...chosenTarget()(ctx),
  ...neighboursOfTarget()(ctx),
];

// PRIME_145 spell: "Disable a minion and the minions next to it, and deal 1
// damage to them"
export default defineCard('PRIME_145', (n) => ({
  target: anyMinion(),
  onPlay: [
    damage(targetAndNeighbours, n.primary),
    disable(targetAndNeighbours),
  ],
}));
