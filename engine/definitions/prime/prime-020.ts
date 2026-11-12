import { defineCard } from '../define-card';
import { silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { findMinion } from '../../rules/lookup';

// PRIME_020 Magic Mushroom, warcry: "Suppress a minion with Cost 3 or less"
export default defineCard('PRIME_020', () => ({
  target: (c) => {
    if (c.candidate.kind !== 'minion') return false;
    const m = findMinion(c.state, c.candidate.instanceId)?.minion;
    return !!m && (c.catalog?.get(m.cardId)?.cost ?? 99) <= 3;
  },
  onPlay: [silence(chosenTarget())],
}));
