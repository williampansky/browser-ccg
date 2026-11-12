import { defineCard } from '../define-card';
import { damage, silence } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter, anyMinion } from '../../effects/filters';

// PRIME_119 Maven of Lost Souls, warcry: "Select One: Deal 2 damage; or Suppress a minion"
export default defineCard('PRIME_119', () => ({
  choices: [
    { label: 'Deal 2 damage', target: anyCharacter(), onPlay: [damage(chosenTarget(), 2)] },
    { label: 'Suppress a minion', target: anyMinion(), onPlay: [silence(chosenTarget())] },
  ],
}));
