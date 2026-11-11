import { defineCard } from '../define-card';
import { keepFromTop } from '../../effects/primitives';

// CORE_055 Surveying Drone, spell: "Draw the next 3 cards from your deck; choose 1 and discard the others"
// (hsclone drew only 2). One option per card position; the UI can show the top cards as the labels.
export default defineCard('CORE_055', (n) => ({
  choices: Array.from({ length: n.primary }, (_, i) => ({
    label: `Keep card ${i + 1}`,
    onPlay: [keepFromTop(n.primary, i)],
  })),
}));
