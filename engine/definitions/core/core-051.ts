import { defineCard } from '../define-card';
import { damage, draw } from '../../effects/primitives';
import { chosenTarget } from '../../effects/selectors';
import { anyCharacter } from '../../effects/filters';

// CORE_051 Nature's Wrath, spell, "Select One: Deal 5 damage or 2 and draw a card"
// (hsclone never drew the card; the printed text wins)
export default defineCard('CORE_051', (n) => ({
  choices: [
    { label: `Deal ${n.primary} damage`, target: anyCharacter(), onPlay: [damage(chosenTarget(), n.primary)] },
    {
      label: `Deal ${n.secondary} damage and draw a card`,
      target: anyCharacter(),
      onPlay: [damage(chosenTarget(), n.secondary), draw(1)],
    },
  ],
}));
