import { defineCard } from '../define-card';
import type { Effect } from '../../effects/types';

const BONUS_PER_CARD = 2;

// PRIME_199: "Gain +2/+2 for each other card you've played this turn". The
// count has already included this card by the time the On Play effect runs.
const growPerCard: Effect = (ctx) => {
  const others = (ctx.g.players[ctx.caster].plays?.now ?? 1) - 1;
  const minion = ctx.g.players[ctx.caster].board.find(
    (m) => m.instanceId === ctx.self,
  );
  if (!minion || others <= 0) return;

  const bonus = others * BONUS_PER_CARD;
  minion.attack += bonus;
  minion.maxHealth += bonus;
  minion.health += bonus;
};

export default defineCard('PRIME_199', () => ({ onPlay: [growPerCard] }));
